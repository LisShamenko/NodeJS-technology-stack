const { request } = require('graphql-request');
const axios = require('axios');



// --------------- 5. Клиенты GraphQL.

const { ApolloServer } = require('apollo-server');

// 
async function createServer(typeDefs, resolvers) {
    return new Promise(async (resolve, reject) => {

        // создание сервера Apollo с передачей схемы и распознавателя
        const server = new ApolloServer({ typeDefs, resolvers });

        // запуск сервера
        server.listen().then((info) => {
            console.log(`--- GraphQL Service: ${info.url}`);
            resolve({ server: server, url: info.url });
        });
    });
}

// 
async function addFakeUsers(count) {

    // --- --- axios

    return new Promise(async (resolve, reject) => {

        axios
            .get(`https://randomuser.me/api/?results=${count}`)
            .then(res => {
                let users = [];
                res.data.results.forEach(record => {
                    console.log(`--- --- ${JSON.stringify(record, null, 2)}`);
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

    // --- --- fetch

    //      let url = `https://randomuser.me/api/?results=${count}`;
    //      let { results } = await fetch(url).then(res => res.json());
    //      return results.map(item => ({
    //          login: item.login.username,
    //          name: `${item.name.first} ${item.name.last}`,
    //          avatar: item.picture.thumbnail,
    //      }));
}

// --- 5.1 Запросы на выборку.

// --- --- curl

async function require_1() {

    console.log('--- --- --- запрос при помощи curl --- --- ---');

    // определение схемы
    const typeDefs = `
        type Query {
            totalUsers: Int!
            totalPhotos: Int!
        }
    `;

    // определение распознавателей
    const resolvers = {
        Query: {
            totalUsers: () => 11,
            totalPhotos: () => {
                setTimeout(() => server.stop(), 1000);
                return 22;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Выполнение запроса с помощью cURL, для Windows следует заключать 
    //      команды в двойные кавычки:
    //      - запрос: { totalPhotos, totalUsers }
    //      - конечная точка GraphQL: http://localhost:4000
    //      - тип содержимого: "Content-Type: application/json"

    //      curl --location --request POST "http://localhost:4000/" \ 
    //          --header "Content-Type: application/json" \ 
    //          --data-raw "{ \"query\": \"{ totalUsers totalPhotos }\" }"


}

// --- --- fetch

async function require_2() {

    console.log('--- --- --- запрос при помощи fetch --- --- ---');

    let data = {
        server: null,
        client: null
    };

    // определение схемы
    const typeDefs = `
        type Query {
            totalUsers: Int!
            totalPhotos: Int!
        }
    `;

    // определение распознавателей
    const resolvers = {
        Query: {
            totalUsers: () => 11,
            totalPhotos: () => {
                //setTimeout(() => {
                //    data.server.stop();
                //    data.client.delete();
                //}, 1000);
                return 22;
            }
        }
    }

    // создать сервер
    const serverApp = await createServer(typeDefs, resolvers);
    data.server = serverApp.server;

    // Выполнение запроса с помощью fetch:
    //      let query = `{totalPhotos, totalUsers}`;
    //      let url = 'http://localhost:4000/graphql';
    //      let opts = {
    //          method: 'POST',
    //          headers: { 'Content-Type': 'application/json' },
    //          body: JSON.stringify({ query })
    //      }
    //      fetch(url, opts)
    //          .then(res => res.json())
    //          // результат выводится в консоль
    //          .then(console.log)
    //          // перечисление результатов запроса в HTML
    //          .then(({ data }) => `
    //              <p>photos: ${data.totalPhotos}</p>
    //              <p>users: ${data.totalUsers}</p>
    //          `)
    //          .then(text => document.body.innerHTML = text)
    //          .catch(console.error);

    // 
    const { createClientFetch } = require('./../client/example_5_2/clientApp');
    data.client = await createClientFetch();
}

// --- --- graphql-request

// Пакет graphql-request обертывает запросы в promise, который используется
//      для ожидания результата от сервера GraphQL. 
//      npm install graphql-request

async function require_3() {

    console.log('--- --- --- graphql-request --- --- ---');

    // 
    const typeDefs = `
        type Query {
            totalPhotos: Int!
        }
        type Mutation {
            postPhoto(name: String!, description: String): Boolean!
        }
    `;

    // определение распознавателей
    const resolvers = {
        Query: {
            totalPhotos: (parent, args, context) => {
                return context.photos.length;
            }
        },
        Mutation: {
            postPhoto(parent, args, context) {
                context.photos.push(args);
                return true;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);
    server.context = {
        photos: [],
    }

    // запрос
    let query =
        `
            { 
                totalPhotos 
            }
        `;

    // мутация
    let mutation =
        `
            mutation newPhoto($name: String!, $description: String) {
                postPhoto(name: $name, description: $description)
            }
        `;

    // 
    let variables = {
        "name": "sample photo B",
        "description": "sample description"
    };

    // функция запроса принимает URL-адрес сервиса GraphQL, строку мутации и
    //      объект с данными, передаваемыми на сервер
    const mutationResult = await request('http://localhost:4000', mutation, variables);
    console.log(`--- is mutation: ${mutationResult.postPhoto}`);

    // функция запроса принимает URL-адрес сервиса GraphQL и строку запроса,
    //      выполняет запрос и возвращает данные
    const queryResult = await request('http://localhost:4000', query);
    console.log(`--- totalPhotos: ${queryResult.totalPhotos}`);

    server.stop();
}

// --- --- компонент React

// Сборка React-приложения 'example_5_4.js'
//      npm run graphql-4

// Запуск клиента
//      ./example_5_4/index.html

async function require_4() {

    console.log('--- --- --- простое приложение React --- --- ---');

    // 
    const typeDefs = `
        type User {
            login: ID!
            name: String
            avatar: String
        }
        type Query {
            allUsers: [User!]!
            stopServer: Boolean!
        }
        type Mutation {
            addFakeUsers(count: Int=1): [User!]!
        }
    `;

    // 
    const resolvers = {
        Query: {
            allUsers: (parent, args, context) => {
                return context.users;
            },
            stopServer: (parent, args, context) => {
                setImmediate(() => context.server.stop());
                return true;
            }
        },
        Mutation: {
            async addFakeUsers(parent, args, context) {
                let users = await addFakeUsers(args.count);
                users.forEach(user => {
                    context.users.push({
                        id: context.autoID++,
                        ...user,
                    });
                });
                return context.users;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);
    server.context = {
        users: [],
        server: server,
        autoID: 0,
    }
}

// --- 5.2 Apollo Client.

// Преимуществом REST является простота кэширования. С помощью REST можно 
//      сохранить результат запроса в кэше по URL запроса. Кэширование GraphQL
//      сложнее, поскольку имеется только одна конечная точка, то нельзя 
//      кэшировать результаты запросов на основе URL. 

// Apollo Client - это клиент GraphQL. Apollo Link обрабатывает запросы.
//      Apollo Cache выполняет кеширование.

// --- --- настройка Apollo Client и проекта React

// Установить пакеты:
//      npm install graphql apollo-boost react-apollo
//          graphql - парсер языка GraphQL;
//          apollo-boost - необходим для создания клиента Apollo;
//          react-apollo - компоненты React для создания UI с помощью Apollo;

// Установить пакет для управления кешем:
//      npm install apollo-cache-persist

// Устанвоить пакет 'create-react-app' для создания приложений React. 
//      npm install -g create-react-app

// Создать приложение React в указанной папке.
//      create-react-app photo-share-client

// Старт приложения.
//      npm start

// --- 5.3 Компонент Query.

// Компонент Query отправляет запросы GraphQL, извлекает данные, обрабатывает 
//      загрузку и обновляет UI. Компонент применяется внутри ApolloProvider.

// Сборка React-приложения 'example_5_5.js'
//      npm run graphql-5

// Запуск клиента
//      ./example_5_5/index.html

// --- 5.4 Компонент Mutation.

// Компонент Mutation позволяет отправлять мутации в сервис GraphQL. 

// Сборка React-приложения 'example_5_6.js'
//      npm run graphql-6

// Запуск клиента
//      ./example_5_6/index.html

// --- 5.5 Работа с кэшем.

// Apollo Cache позволяет свести к минимуму количество сетевых запросов.

// --- --- политики выборки

// По умолчанию Apollo Client хранит данные в локальной переменной JavaScript. 
//      При создании клиента автоматически создается кэш. При отправке операции
//      ответ будет кешироваться локально. 

// Свойство fetchPolicy указывает, где искать данные для разрешения операции: 
//      локальный кэш или сетевой запрос. 

// По умолчанию используется значение cache-first, которое означает, что клиент 
//      будет искать данные в локальном кэше. Если данные не находятся в кэше, 
//      то клиент отправит сетевой запрос сервису GraphQL. 

// Значение cache-only означает, что поиск выполняется только в кэше и никогда 
//      не посылает сетевой запрос. Если данные отсутствуют в кэше, то будет 
//      выдана ошибка.

// Значение cache-and-network означает, что сначала выполняется поиск данных
//      в хэше. Если данные отсутствуют в кэше, то выполняется сетевой запрос. 

// Другие доступные политики:
//      network-only - всегда посылает сетевой запрос;
//      no-cache - всегда посылает сетевой запрос для разрешения 
//          данных и не кэширует ответ;

// Политика хэширования:
//      <Query query={{ query: ROOT_QUERY }} fetchPolicy="cache-only">
//      <Query query={{ query: ROOT_QUERY }} fetchPolicy="cache-and-network">

// --- --- сохранение и обновление кэша

// Пакет apollo-cache-persist содержит функцию persistCache, которая сохраняет 
//      кэш в локальном хранилище каждый раз, когда он изменяется.

// Компонент Query способен считывать данные напрямую из кэша, что соответствует
//      политике кэширования cache-only. С Apollo Cache можно взаимодействовать 
//      напрямую, то есть считывать или записывать данные. 

// При изменении данных в кэше все затронутые компоненты будут отображаться 
//      повторно. Данные считываются из Apollo Cache с помощью запросов GraphQL.
//      Данные записываются в Apollo Cache с помощью мутаций GraphQL.

// Сборка React-приложения 'example_5_7.js'
//      npm run graphql-7

// Запуск клиента
//      ./example_5_7/index.html

async function require_5_6_7() {

    console.log('--- --- --- компоненты Query и Mutation --- --- ---');

    // 
    const typeDefs = `
        type User {
            login: ID!
            name: String
            avatar: String
        }
        type Query {
            totalUsers: Int!
            allUsers: [User!]!
        }
        type Mutation {
            addFakeUsers(count: Int=1): [User!]!
        }
    `;

    // 
    const resolvers = {
        Query: {
            totalUsers: (parent, args, context) => context.users.length,
            allUsers: (parent, args, context) => context.users,
        },
        Mutation: {
            async addFakeUsers(parent, args, context) {
                let users = await addFakeUsers(args.count);
                users.forEach(user => {
                    context.users.push({
                        id: context.autoID++,
                        ...user,
                    });
                });
                return context.users;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);
    server.context = {
        users: [],
        server: server,
        autoID: 0,
    }

    //
    let users = await addFakeUsers(3);
    users.forEach(user => {
        server.context.users.push({
            id: server.context.autoID++,
            ...user,
        });
    });
}

// --- Запуск.

module.exports = (example) => {
    if (example === 1) require_1();
    if (example === 2) require_2();
    if (example === 3) require_3();
    if (example === 4) require_4();
    if (example === 5) require_5_6_7();
    if (example === 6) require_5_6_7();
    if (example === 7) require_5_6_7();
}