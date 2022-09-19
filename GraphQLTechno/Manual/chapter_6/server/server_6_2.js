// 
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer: ApolloServerExpress } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { PubSub } = require('graphql-subscriptions');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

// 
const express = require('express');
const { createServer } = require('http');
const bodyParser = require('body-parser');

//
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');

// 
const path = require('path');
const fs = require('fs');



// 
const pubsub = new PubSub();
//pubsub.subscribe('photo-added', (message) => console.log('photo-added: ', message));

//
async function createApolloServer(typeDefs, resolvers, db) {
    return new Promise(async (resolve, reject) => {

        // 
        const app = express();
        const httpServer = createServer(app);

        // --- --- Error: installSubscriptionHandlers

        // Apollo Server 3 не содержит функцию installSubscriptionHandlers.
        //      Функция installSubscriptionHandlers обеспечивала работу веб-сокетов.
        //      Apollo Server добавляет необходимые обработчики для поддержки 
        //      подписки с помощью веб-сокетов.
        //      server.installSubscriptionHandlers(httpServer);

        // Экземпляр WebSocketServer используется в качестве сервера подписки.
        //      Использует протокол библиотеки graphql-ws.
        const wsServer = new WebSocketServer({
            server: httpServer,
            // url-адрес, который обслуживает ApolloServer
            path: '/graphql',
        });

        // 
        wsServer.on('connection', function connection(ws) {
            ws.on('message', (data) => console.log('received: %s', data));
        });

        // 
        const schema = makeExecutableSchema({ typeDefs, resolvers });

        // прослушивание WebSocketServer
        const serverCleanup = useServer(
            {
                schema,
                onConnect: async (ctx) => {
                    console.log('Connected!');
                    console.log('--- connectionParams.authToken: ', ctx.connectionParams.authToken);
                },
                onDisconnect: (ctx, code, reason) => {
                    console.log('Disconnected!')
                },
            },
            wsServer
        );

        // 
        const server = new ApolloServerExpress({
            schema,
            csrfPrevention: false,
            cors: {
                origin: ["http://localhost:4000"]
            },
            context: ({ req, connection }) => {
                console.log('--- query: ', req.body.query);
                const currentUser = {
                    login: req ? req.headers.authorization : connection.context.Authorization
                };
                return { currentUser, db };
            },
            subscriptions: {
                onConnect: () => console.log("Subscription connected."),
                onDisconnect: () => console.log("Subscription disconnected."),
            },
            plugins: [
                // Правильное завершение работы HTTP-сервера.
                ApolloServerPluginDrainHttpServer({ httpServer }),
                // Правильное завершение работы сервера WebSocket.
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await serverCleanup.dispose();
                            },
                        };
                    },
                },
            ],
        });
        await server.start();

        // 
        app.use('/graphql', bodyParser.json());
        app.use(graphqlUploadExpress());
        app.get('/', (req, res) => res.end('Welcome!'));
        app.get('/playground', expressPlayground({ endpoint: '/' }));
        app.use('/img/photos', express.static(path.join(__dirname, 'photos')));
        server.applyMiddleware({ app });

        // 
        httpServer.listen({ port: 4000 }, () => {
            console.log(`
                --- GraphQL server:     http://localhost:4000${server.graphqlPath} 
                --- WebSocket server:   ws://localhost:4000${wsServer.options.path}
            `);
            resolve({
                server: server,
                url: `http://localhost:4000${server.graphqlPath}`,
                ws: `ws://localhost:4000${wsServer.options.path}`
            });
        });
    });
}

// функция загрузки файла 
async function uploadStream(readStream, path) {
    return new Promise(async (resolve, reject) => {
        const writeStream = fs.createWriteStream(path);
        readStream
            .pipe(writeStream)
            .on('finish', () => resolve());
    })
}

(async () => {

    // 
    const typeDefs = `

        # --- скалярный тип для загрузки фото
        scalar Upload

        # --- тип ввода для добавления фото
        input PostPhotoInput {
            name: String!
            description: String
            file: Upload
        }   

        # --- объект фото
        type Photo {
            id: ID!
            name: String!
            description: String
        }

        # --- запросы
        type Query {
            totalPhotos: Int!
            allPhotos: [Photo]
        }

        # --- мутации
        type Mutation {
            postPhoto(input: PostPhotoInput!): Photo!
        }

        # --- подписки
        type Subscription {
            newPhoto: Photo
        }
    `;

    // 
    const resolvers = {
        // сопоставляет скалярный тип Upload с реализацией из пакета graphql-upload
        Upload: GraphQLUpload,
        // запросы
        Query: {
            totalPhotos: (parent, args, context) => {
                return context.db.photos.length;
            },
            allPhotos: (parent, args, context) => {
                return context.db.photos;
            }
        },
        // мутации
        Mutation: {
            async postPhoto(root, args, context) {

                // 
                const newPhoto = {
                    id: context.db.autoID++,
                    ...args.input,
                }
                context.db.photos.push(newPhoto);

                // 
                if (args.input.file) {

                    // фотография именуется на основе ее уникального идентификатора
                    let toPath = path.join(__dirname, 'photos', `${newPhoto.id}.jpg`);

                    // аргумент file содержит поток загрузки, который может быть отправлен 
                    //      в writeStream и сохранен локально в указанном каталоге 
                    const result = await args.input.file;
                    await uploadStream(result.createReadStream(), toPath);
                }

                // 
                pubsub.publish('photo-added', { newPhoto });
                return newPhoto;
            },
        },
        Subscription: {
            newPhoto: {
                subscribe: (parent, args, context) => {
                    return pubsub.asyncIterator(['photo-added']);
                }
            }
        }
    }

    // 
    const db = { autoID: 0, photos: [] };
    const { server, url, ws } = await createApolloServer(typeDefs, resolvers, db);
    server.context.db = db;
})();