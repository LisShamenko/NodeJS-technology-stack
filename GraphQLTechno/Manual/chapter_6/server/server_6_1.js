// 
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer: ApolloServerExpress } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { PubSub } = require('graphql-subscriptions');
const { SubscriptionServer } = require('subscriptions-transport-ws');

// 
const express = require('express');
const { createServer } = require('http');
const bodyParser = require('body-parser');

// Пакет apollo-upload-server устарел и заменен на graphql-upload.
//      const { GraphQLUpload } = require('apollo-upload-server');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
const { GraphQLScalarType, execute, subscribe } = require('graphql');

// 
const axios = require('axios');
const path = require('path');
const fs = require('fs');



// 
async function addFakeUsers(count) {
    return new Promise(async (resolve, reject) => {

        axios
            .get(`https://randomuser.me/api/?results=${count}`)
            .then(res => {
                let users = [];
                res.data.results.forEach(record => {
                    //      console.log(`--- --- ${JSON.stringify(record, null, 2)}`);
                    users.push({
                        login: record.login.username,
                        name: `${record.name.first} ${record.name.last}`,
                        avatar: record.picture.thumbnail,
                    });
                });
                resolve(users);
            })
            .catch(error => {
                console.log('--- Ошибка: ', error);
                reject();
            });
    })
}

// 
async function clientRequest(url, query, variables = {}) {
    return new Promise(async (resolve, reject) => {

        //      console.log('--- Запрос: ', query);
        //      Object.keys(variables)
        //          .map(key => console.log('--- --- Переменная: ', variables[key]));

        axios
            .post(url, {
                query: query,
                variables: variables
            })
            .then(res => {
                //      console.log('--- Ответ: ', res.status);
                //      console.log('--- Результат: ', JSON.stringify(res.data, null, 2));
                resolve(res.data);
            })
            .catch(error => {
                console.log('--- Ошибка: ', error);
                reject();
            });
    });
}

// 
const pubsub = new PubSub();
pubsub.subscribe('photo-added', (message) => {
    console.log('--- --- message: ', message);
});

//
async function createApolloServer(typeDefs, resolvers, db) {
    return new Promise(async (resolve, reject) => {

        // Сервер подписки не принимает параметры typeDefs и resolvers. 
        //      Вместо этого экземпляр GraphQLSchema передается серверу 
        //      подписки и серверу Apollo. Это гарантирует, что одна и 
        //      та же схема используется в обоих местах.
        const schema = makeExecutableSchema({ typeDefs, resolvers });

        // Apollo Server для автоматической настройки подписок требуется 
        //      HTTP-сервер. Объект httpServer будет обрабатывать запросы 
        //      HTTP на основе конфигурации Express.
        const app = express();
        const httpServer = createServer(app);

        // создает сервер подписки с протоколом соответствующий библиотеки
        //      subscriptions-transport-ws 
        const subscriptionServer = new SubscriptionServer(
            { execute, subscribe, schema: schema },
            { server: httpServer, path: '/graphql' }
        );

        // использование модуля fs для чтения файла typeDefs.graphql
        const server = new ApolloServerExpress({
            schema,
            csrfPrevention: false,
            cors: {
                origin: ["http://localhost:4000"]
            },
            // замена контекстной функции
            context: ({ req, connection }) => {

                // Для операций Query и Mutation выполняется запрос HTTP, поэтому 
                //      аргумент запроса req отправляется обработчику контекста. 
                //      Для операций subscription запрос HTTP не выполняется, 
                //      поэтому аргумент req равен null. 

                // Информация для подписок передается при подключении клиента 
                //      к веб-сокету через аргумент connection. 

                // данные авторизации передаются через контекст подключения, а 
                //      не заголовки HTTP-запросов
                const currentUser = {
                    login: req ? req.headers.authorization : connection.context.Authorization
                };
                return { currentUser, db };
            },
            subscriptions: {
                onConnect: () => {
                    console.log("Connected.");
                },
                onDisconnect: () => {
                    console.log("Disconnected.");
                }
            },
            plugins: [
                // Правильное завершение работы HTTP-сервера.
                ApolloServerPluginDrainHttpServer({ httpServer }),
                // Правильное завершение работы сервера подписки.
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                //await subscriptionServer.close();
                            },
                        };
                    },
                },
            ],
        });
        await server.start();

        // промежуточное ПО для загрузки файлов
        app.use('/graphql', (req, res, next) => {
            next();
        });
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlUploadExpress());

        // 
        app.get('/', (req, res) => res.end('Welcome!'));

        // маршрут для тестирования через Playground:
        //      http://localhost:4000/playground
        app.get('/playground', expressPlayground({ endpoint: '/' }));

        // обработка статичных файлов в каталоге './photos' позволяет 
        //      запрашивать сохраненные пользователем фото
        app.use('/img/photos', express.static(path.join(__dirname, 'photos')));

        // обработка ошибок
        app.use(function (err, req, res, next) {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        })

        // добавить промежуточное ПО, должно следовать после всех вызовов use 
        //      для сервера express, иначе можно получить ошибку:
        //          Unexpected token P in JSON at position 0
        //      с содержимым body:
        //          mutation POST body missing, invalid Content-Type, or JSON object has no keys
        server.applyMiddleware({ app });

        // сервер начинает прослушивать транспорты HTTP и WebSocket одновременно
        httpServer.listen({ port: 4000 }, () => {
            console.log(`
                --- GraphQL server:     http://localhost:4000${server.graphqlPath} 
                --- WebSocket server:   ws://localhost:4000${subscriptionServer.wsServer.options.path}
            `);
            resolve({
                server: server,
                subscriptionServer: subscriptionServer,
                url: `http://localhost:4000${server.graphqlPath}`,
                ws: `ws://localhost:4000${subscriptionServer.wsServer.options.path}`
            });
        });

        // Проверка публикации сообщения.
        //      setTimeout(() => {
        //          pubsub.publish("photo-added", { url: "", category: "" });
        //      }, 1000);
    });
}

// 
async function mutationNewPhoto(url, name, description, category, login) {
    await clientRequest(url,
        `
            mutation newPhoto($input: PostPhotoInput!) {
                postPhoto(input:$input) {
                    id
                    name
                    url
                    description
                    category
                }
            }
        `,
        {
            "input": {
                "name": name,
                "description": description,
                "category": category,
                "userLogin": login,
            }
        }
    ).catch((err) => console.log('--- --- X --- ---', err));
}

// проверка соединения сокетов
async function plugToSocket(wsURL) {
    return new Promise(async (resolve, reject) => {

        console.log(`--- --- socket URL: ${wsURL}`);

        const WebSocket = require('ws');
        const myWS = new WebSocket(wsURL);

        myWS.onopen = () => {
            console.log('--- onopen');
            resolve(true);
        }

        myWS.onerror = (err) => {
            console.log(`--- onerror --- Error: ${err}`);
            reject(false);
        }

        myWS.onmessage = (message) => {
            console.log(`--- onmessage --- Message: ${message.data}`);
        }

        myWS.onclose = function (event) {
            if (event.wasClean) {
                console.log(`--- onclose --- соединение закрыто чисто`);
            }
            else {
                console.log(`--- onclose --- обрыв соединения`);
            }
            console.log(`--- onclose --- code: ${event.code} --- reason: ${event.reason}`);
        };
    });
}

// функция загрузки файла 
async function uploadStream(readStream, path) {
    return new Promise(async (resolve, reject) => {

        const writeStream = fs.createWriteStream(path);
        readStream
            .pipe(writeStream)
            .on('finish', () => {
                resolve()
            });

        //  stream
        //      .on('error', error => {
        //          if (stream.truncated) {
        //              fs.unlinkSync(path);
        //          }
        //          reject(error);
        //      })
        //      .on('end', resolve)
        //      .pipe(fs.createWriteStream(path))
    })
}

// 
(async () => {

    console.log('--- --- --- компоненты Query и Mutation --- --- ---');

    // Сервер Apollo предоставляет скалярный тип Upload, который применяется 
    //      для захвата stream, mimetype и encoding загруженного файла.
    //      Тип Upload позволяет передать содержимое файла с помощью типа ввода 
    //      PostPhotoInput. Доступ к файлу можно получить в распознавателе.
    //      Тип Upload содержит stream, который можно использовать для сохранения 
    //      файла.

    const typeDefs = `

        # --- скалярный тип
        scalar DateTime

        # --- скалярный тип для загрузки фото
        scalar Upload

        # --- перечисление категорий фото
        enum PhotoCategory {
            SELFIE
            PORTRAIT
            ACTION
            LANDSCAPE
            GRAPHIC
        }

        # --- тип ввода для добавления фото
        input PostPhotoInput {
            name: String!
            category: PhotoCategory=PORTRAIT
            description: String
            userLogin: String
            file: Upload                        # поле загрузки файлов
        }   

        # --- объект фото
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
            category: PhotoCategory!
            userLogin: String
            created: DateTime!
            postedBy: User!
        }

        # --- объект пользователя
        type User {
            login: ID!
            name: String
            avatar: String
            postedPhotos: [Photo!]!
        }

        # --- запросы
        type Query {
            totalPhotos: Int!
            totalUsers: Int!
            allPhotos(after: DateTime): [Photo!]!
            allUsers: [User!]!
        }

        # --- мутации
        type Mutation {
            addFakeUsers(count: Int=1): [User!]!
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
                return context.db.photos.length
            },
            totalUsers: (parent, args, context) => {
                return context.db.users.length
            },
            allPhotos: (parent, args, context) => {
                return context.db.photos
            },
            allUsers: (parent, args, context) => {
                return context.db.users
            },
        },
        // мутации
        Mutation: {
            async addFakeUsers(parent, args, context) {
                let users = await addFakeUsers(args.count);
                users.forEach(user => {
                    context.db.users.push({
                        id: context.db.autoID++,
                        ...user,
                    });
                });
                return context.db.users;
            },
            async postPhoto(parent, args, context) {

                // 
                const newPhoto = {
                    id: context.db.autoID++,
                    userLogin: args.input.userLogin, // context.currentUser.login, // 
                    created: new Date(),
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

                // Распознаватель ожидает, что в контекст добавлен экземпляр pubsub, 
                //      который может публиковать события и отправлять данные каждому 
                //      подписанному обработчику.

                // публикация события 'photo-added'
                pubsub.publish('photo-added', { newPhoto });

                return newPhoto;
            }
        },
        // объекты
        Photo: {
            url: (parent) => `http://localhost:4000/img/photos/${parent.id}.jpg`,
            postedBy: (parent) => users.find(user => user.login === parent.userLogin),
        },
        User: {
            postedPhotos: (parent) => photos.filter(photo => photo.userLogin === parent.login),
        },
        // скалярные типы
        DateTime: new GraphQLScalarType({
            name: 'DateTime',
            description: 'A valid date time value.',
            parseValue: (value) => new Date(value),
            serialize: (value) => new Date(value).toISOString(),
            parseLiteral: (ast) => ast.value,
        }),
        // Корневой распознаватель Subscription должен быть добавлен сразу
        //      за распознавателями Query и Mutation.
        Subscription: {
            // Внутри распознавателя Subscription определяется распознаватель
            //      для поля newPhoto.
            newPhoto: {
                // Распознаватель Subscription содержит метод подписки, внутри 
                //      которого выполняется подписка на конкретные события.
                //      Метод подписки получает [parent, args, context]. 
                subscribe: (parent, args, context) => {
                    // asyncIterator подписывается на событие photo-added
                    return pubsub.asyncIterator(['photo-added']);
                }
            }
        }
    }

    // создать сервер
    const db = { autoID: 0, users: [], photos: [], server: null, }
    const { server, url, ws } = await createApolloServer(typeDefs, resolvers, db);
    server.context.db = db;

    // подключиться к сокету для оповещения клиента
    await plugToSocket(ws);

    //
    let users = await addFakeUsers(3);
    users.forEach(user => {
        server.context.db.users.push({
            id: server.context.db.autoID++,
            ...user,
        });
    });

    //
    await clientRequest(url,
        `
            subscription {
                newPhoto {
                    url
                    category
                }
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    //
    const result = await clientRequest(url,
        `
            { 
                allUsers {
                    login
                }
                totalUsers
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    // 
    await mutationNewPhoto(url, "photo A", "...", "SELFIE", result.data.allUsers[0].login);
    await mutationNewPhoto(url, "photo B", "...", "PORTRAIT", result.data.allUsers[1].login);
    await mutationNewPhoto(url, "photo C", "...", "ACTION", result.data.allUsers[1].login);
    await mutationNewPhoto(url, "photo D", "...", "LANDSCAPE", result.data.allUsers[2].login);
    await mutationNewPhoto(url, "photo E", "...", "GRAPHIC", result.data.allUsers[2].login);
    await mutationNewPhoto(url, "photo F", "...", "ACTION", result.data.allUsers[2].login);

    // 
    await clientRequest(url,
        `
            query listPhotos {
                allPhotos {
                    id
                    name
                    description
                    url
                    category
                }
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    // 
    await clientRequest(url,
        `
            query photos {
                allPhotos {
                    name
                    url
                    postedBy {
                        name
                    }
                }
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));
})();