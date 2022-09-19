const { GraphQLScalarType, print } = require('graphql');
const { ApolloServer } = require('apollo-server');
const { ApolloServer: ApolloServerExpress } = require('apollo-server-express');
const { gql } = require('apollo-boost');

const express = require('express');

const expressPlayground = require('graphql-playground-middleware-express').default;

const { readFileSync } = require('fs');
const path = require('path');
const http = require('http');
const axios = require('axios');



// --------------- 4. Сервер GraphQL.

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
async function clientRequest(url, query, variables = {}) {
    return new Promise(async (resolve, reject) => {

        console.log('--- Запрос: ', query);
        Object.keys(variables)
            .map(key => console.log('--- --- Переменная: ', variables[key]));

        axios
            .post(url, {
                query: query,
                variables: variables
            })
            .then(res => {
                console.log('--- Ответ: ', res.status);
                console.log('--- Результат: ', JSON.stringify(res.data, null, 2));
                resolve(res.data);
            })
            .catch(error => {
                console.log('--- Ошибка: ', error);
                reject();
            });
    });
}

// --- 4.1 Настройка проекта.

// - создать папку проекта photo-share-api;
// - создать проект внутри папки командой 'npm init -y';
// - установить зависимости проекта: 
//      apollo-server и graphql необходимы для установки экземпляра Apollo Server;
//      nodemon сканирует файлы и в случае их изменения перезапускает сервер.
//      npm install apollo-server graphql nodemon
// - добавить команду 'npm start' в файл package.json для запуска приложения, 
//      nodemon будет следить за изменениями в файлах с расширением js, json, 
//      graphql:
//      "scripts": {
//          "start": "nodemon -e js,json,graphql"
//      }
// - создать файл index.js и добавить в файл package.json:
//      "main": "index.js"

// --- 4.2 Распознаватели.

// Схема определяет операции запроса, связь между типами и описывает требования
//      к данным. Схема не занимается получением данных, это делают распознаватели.

// Распознаватель - это функция, которая возвращает данные для определенного поля.
//      Распознаватели могут быть асинхронными, могут выполнять операции REST API,
//      баз данных или другого сервиса.

// Каждое поле должно иметь распознаватель, который должен следовать правилам схемы: 
// - распознаватель возвращает данные типа, который указан в схеме;
// - распознаватель вызывается в ответ на запрос totalPhotos;
// - распознаватель определяется как объект с тем же именем, что и объект в схеме, 
//      поле totalPhotos является частью запроса и распознаватель для totalPhotos 
//      должен быть частью объекта Query.

async function require_1() {

    console.log('--- --- --- простой распознаватель --- --- ---');

    // определение схемы
    const typeDefs = `
        type Query {
            totalPhotos: Int!
        }
    `;

    // определение распознавателей
    const resolvers = {
        Query: {
            totalPhotos: () => {
                return 42;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Запрос GraphQL, возвращает количество фото.
    await clientRequest(url,
        `
            { 
                totalPhotos 
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    server.stop();
}

// --- --- корневые распознаватели

// API GraphQL имеют корневые типы [Query, Mutation, Subscription], которые
//      находятся на верхнем уровне. Эти типы являются точками входа в API.

async function require_2() {

    console.log('--- --- --- простая мутация --- --- ---');

    // В схеме определена мутация postPhoto, которая принимает два аргумента
    //      [name, description] и возвращает логическое значение (Boolean).
    const typeDefs = `
        type Query {
            totalPhotos: Int!
        }
        type Mutation {
            postPhoto(name: String!, description: String): Boolean!
        }
    `;

    // массив для хранения объектов Photo
    let photos = [];

    // определение распознавателей
    const resolvers = {
        Query: {
            // запрос totalPhotos возвращает длину массива фотографий
            totalPhotos: () => {
                return photos.length;
            }
        },
        Mutation: {
            // распознаватель postPhoto принимает два аргумента:
            //      parent - ссылка на родительский объект (_, root, obj),
            //          который является мутацией;
            //      args - аргументы GraphQL соответствующие схеме: name и
            //          description;
            postPhoto(parent, args) {
                // args является объектом '{ name, description }', поэтому
                //      добавляется в массив photos
                photos.push(args);
                return true;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Запрос возвращает количество фото.
    await clientRequest(url,
        `
            { 
                totalPhotos 
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    // Мутация добавляет фото и возвращает true.
    await clientRequest(url,
        `
            mutation newPhoto {
                postPhoto(name: "sample photo A")
            }
        `
    ).catch((err) => console.log('--- --- II --- ---', err));

    // Мутация с использованием переменных запроса.
    await clientRequest(url,
        `
            mutation newPhoto($name: String!, $description: String) {
                postPhoto(name: $name, description: $description)
            }
        `,
        // Данные, которые должны передаваться в мутацию.
        {
            "name": "sample photo B",
            "description": "sample description"
        }
    ).catch((err) => console.log('--- --- III --- ---', err));

    // Запрос возвращает количество фото.
    await clientRequest(url,
        `
            { 
                totalPhotos 
            }
        `
    ).catch((err) => console.log('--- --- IV --- ---', err));

    server.stop();
}

// --- --- распознаватели типов

// Распознаватели - это функции, которые могут быть асинхронными, возвращают
//      скалярные типы, объекты или данные из разных источников. Каждое поле
//      в схеме GraphQL может отображаться на распознаватель.

async function require_3() {

    console.log('--- --- --- запрос массива --- --- ---');

    // Определение схемы:
    // - добавляется определение типа Photo;
    // - запрос allPhotos возвращает массив Photo;
    // - мутация postPhoto возвращает Photo;
    const typeDefs = `
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
        }
        type Query {
            totalPhotos: Int!
            allPhotos: [Photo!]!
        }
        type Mutation {
            postPhoto(name: String! description: String): Photo!
        }
    `;

    // переменная, которая обеспечивает уникальность идентификатора
    let autoID = 0;

    // массив для хранения объектов Photo
    let photos = [];

    // определение распознавателей
    const resolvers = {
        Query: {
            // запрос totalPhotos возвращает длину массива фотографий
            totalPhotos: () => {
                return photos.length;
            },
            // allPhotos должен вернуть список объектов Photo
            allPhotos: () => {
                return photos;
            },
        },
        Mutation: {
            // распознаватель postPhoto создает новое фото
            postPhoto(parent, args) {

                // создается новый объект фотографии, кроме полей из аргумента
                //      args требуется идентификатор
                let newPhoto = {
                    // идентификатор генерируется при помощи автоинкремента
                    id: autoID++,
                    ...args
                }

                // мутация добавляет объекты Photo в массив photos
                photos.push(newPhoto);

                // мутация возвращает объект Photo
                return newPhoto;
            }
        },
        // URL-адреса могут генерироваться автоматически, поэтому url не передается
        //      в мутацию postPhoto и значение не сохраняется на сервере. Каждое поле
        //      в схеме может отображаться на распознаватель.
        Photo: {
            url: (parent) => {
                return `http://site.com/img/${parent.id}.jpg`;
            }
        }
    }

    // Распознаватель Photo называется тривиальным распознавателем (trivial resolver).
    //      Тривиальные распознаватели добавляются на верхний уровень объекта resolvers.
    //      Через тривиальный распознаватель Photo можно создавать распознаватели
    //      свойств.

    // Если в запросе указать поле url в объекте Photo, то будет вызван соответствующий
    //      распознаватель. Аргумент parent принимает родительский объект, в данном
    //      случае это распознаваемый объект Photo. Через аргумент parent можно
    //      получить идентификатор объекта Photo и сгенерировать URL-адрес.

    // Если добавить поле url в выборку запроса без использования распознавателя, 
    //      то произойдет ошибка: 'Не удается вернуть значение null для поля Photo.url'

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Мутация создает Photo и возвращает сгенерированные поля.
    await clientRequest(url,
        `
            mutation newPhoto($name: String!, $description: String) {
                postPhoto(name: $name, description: $description) {
                    id
                    name
                    description
                }
            }
        `,
        // данные
        {
            "name": "sample photo B",
            "description": "sample description"
        }
    ).catch((err) => console.log('--- --- I --- ---', err));

    // Запрос массива объектов Photo с выборкой из 4 полей.
    await clientRequest(url,
        `
            query listPhotos {
                allPhotos {
                    id
                    name
                    description
                    url
                }
            }
        `
    ).catch((err) => console.log('--- --- II --- ---', err));

    server.stop();
}

// --- 4.3 Использование типов ввода и перечислений.

// Типы ввода делают передачу аргументов для мутаций более универсальной и
//      менее подверженной ошибкам. Перечисления помогают конкретизировать
//      значения, предоставляемые для определенных полей.

async function require_4() {

    console.log('--- --- --- перечисления --- --- ---');

    // Схема с типом перечисления PhotoCategory и типом ввода PostPhotoInput.
    //      Тип ввода имеет поле category, которое принимает значение по умолчанию.
    const typeDefs = `
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
        }

        # --- объект фото
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
            category: PhotoCategory!
        }

        # --- корневой тип запросов
        type Query {
            totalPhotos: Int!
            allPhotos: [Photo!]!
        }

        # --- корневой тип мутаций
        type Mutation {
            postPhoto(input: PostPhotoInput!): Photo!
        }
    `;

    // 
    let autoID = 0;
    let photos = [];

    // определение распознавателей
    const resolvers = {
        Query: {
            // запрос totalPhotos возвращает количество объектов Photo
            totalPhotos: () => {
                return photos.length;
            },
            // запрос allPhotos возвращает список объектов Photo
            allPhotos: () => {
                return photos;
            },
        },
        Mutation: {
            // распознаватель postPhoto создает новое фото
            postPhoto(parent, args) {
                let newPhoto = {
                    id: autoID++,
                    // распознаватель обращается к значениям args.input вместо args
                    ...args.input
                }
                photos.push(newPhoto);
                return newPhoto;
            }
        },
        // тривиальный распознаватель Photo
        Photo: {
            url: (parent) => {
                return `http://site.com/img/${parent.id}.jpg`;
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Мутация с типом ввода.
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
        // данные запроса
        {
            "input": {
                "name": "sample photo A",
                "description": "sample description"
            }
        }
    ).catch((err) => console.log('--- --- I --- ---', err));

    server.stop();
}

// --- 4.4 Ребра и соединения.

// Мощь GraphQL заключается в ребрах, которые соединяют узлы данных. На сервере
//      типы GraphQL сопоставляются со схожыми моделями данных. Аналогично
//      соединения GraphQL связываются с операциями, которые реализуют отношения
//      между моделями.

// --- --- соединение 'один ко многим'

async function require_5() {

    console.log('--- --- --- соединение "один ко многим" --- --- ---');

    const typeDefs = `
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
        }

        # --- объект фото
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
            category: PhotoCategory!
            postedBy: User!             # 1
        }
        
        # --- объект пользователя
        type User {
            login: ID!
            name: String
            avatar: String
            postedPhotos: [Photo!]!     # 2
        }

        # --- корневой тип запросов
        type Query {
            totalPhotos: Int!
            allPhotos: [Photo!]!
        }

        # --- корневой тип мутаций
        type Mutation {
            postPhoto(input: PostPhotoInput!): Photo!
        }
    `;

    // 1. Поле Photo.postedBy является соединением 'один к одному', поскольку Photo
    //      может быть опубликованно только одним User. Если добавить в схему
    //      это соединение вместе с предыдущем, то граф будет неориентированным.

    // 2. Поле User.postedPhotos является соединением 'один ко многим', поскольку
    //      один User может публиковать много Photo. Если добавить это соединение,
    //      то граф будет ориентированным.

    // Соединения создаются с помощью полей объекта, поэтому их можно сопоставлять
    //      с распознавателями. Функция распознавателя получает доступ к данным
    //      соединения через parent, что позволяет найти и вернуть связанные данные.

    // 
    let autoID = 0;
    let photos = [
        { "id": "1", "owner": "foo", "name": "--- 'Foo First' photo ---", "description": "1", "category": "ACTION" },
        { "id": "2", "owner": "bar", "name": "--- 'Bar Second' photo ---", "category": "SELFIE" },
        { "id": "3", "owner": "baz", "name": "--- 'Baz Third' photo ---", "description": "3", "category": "LANDSCAPE" }
    ]
    let users = [
        { "login": "foo", "name": "Foo First" },
        { "login": "bar", "name": "Bar Second" },
        { "login": "baz", "name": "Baz Third" },
    ];

    // определение распознавателей
    const resolvers = {
        Query: {
            totalPhotos: () => photos.length,
            allPhotos: () => photos,
        },
        Mutation: {
            postPhoto(parent, args) {
                let newPhoto = { id: autoID++, ...args.input }
                photos.push(newPhoto);
                return newPhoto;
            }
        },
        // распознаватели postedPhotos и postedBy
        Photo: {
            url: (parent) => `http://site.com/img/${parent.id}.jpg`,
            postedBy: parent => {
                // метод find позволяет найти пользователя в массиве users
                return users.find(u => u.login === parent.owner)
            }
        },
        User: {
            postedPhotos: parent => {
                // метод filter возвращает массив фотографий
                return photos.filter(p => p.owner === parent.login)
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // Запром allPhotos с использованием соединения postedBy. Для каждой запрошенной
    //      фотографии будут запрошены сведения о пользователе, который опубликовал
    //      эту фотографию.
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

    server.stop();
}

// --- --- соединение 'многие ко многим'

// Механизм тегирования реализуется через отношение 'многие ко многим'.
//      Несколько пользователей может быть указано на одном фото, пользователь
//      может быть указан на нескольких фото.

// Схема реализующая соединение 'многие ко многим' через поля
//      Photo.taggedUsers и User.inPhotos.
//      type User {
//              ...
//          inPhotos: [Photo!]!         возвращает список фотографий
//      }
//      type Photo {
//              ...
//          taggedUsers: [User!]!       возвращает список пользователей
//      }

async function require_6() {

    console.log('--- --- --- соединение "многие ко многим" --- --- ---');

    const typeDefs = `
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
        }

        # --- объект фото
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
            category: PhotoCategory!
            postedBy: User!
            taggedUsers: [User!]!           # возвращает список пользователей
        }
        
        # --- объект пользователя
        type User {
            login: ID!
            name: String
            avatar: String
            postedPhotos: [Photo!]!
            inPhotos: [Photo!]!             # возвращает список фотографий
        }

        # --- корневой тип запросов
        type Query {
            totalPhotos: Int!
            allPhotos: [Photo!]!
        }

        # --- корневой тип мутаций
        type Mutation {
            postPhoto(input: PostPhotoInput!): Photo!
        }
    `;

    // 
    let autoID = 0;
    let photos = [
        { "id": "1", "owner": "foo", "name": "--- 'Foo First' photo ---", "description": "1", "category": "ACTION" },
        { "id": "2", "owner": "bar", "name": "--- 'Bar Second' photo ---", "category": "SELFIE" },
        { "id": "3", "owner": "baz", "name": "--- 'Baz Third' photo ---", "description": "3", "category": "LANDSCAPE" }
    ]
    let users = [
        { "login": "foo", "name": "Foo First" },
        { "login": "bar", "name": "Bar Second" },
        { "login": "baz", "name": "Baz Third" },
    ];
    let tags = [
        { "photoID": "1", "userLogin": "bar" },
        { "photoID": "2", "userLogin": "baz" },
        { "photoID": "2", "userLogin": "foo" },
        { "photoID": "3", "userLogin": "baz" },
        { "photoID": "3", "userLogin": "bar" },
        { "photoID": "3", "userLogin": "baz" }
    ]

    // определение распознавателей
    const resolvers = {
        Query: {
            totalPhotos: () => photos.length,
            allPhotos: () => photos,
        },
        Mutation: {
            postPhoto(parent, args) {
                let newPhoto = { id: autoID++, ...args.input }
                photos.push(newPhoto);
                return newPhoto;
            }
        },
        // 
        Photo: {
            url: (parent) => `http://site.com/img/${parent.id}.jpg`,
            postedBy: parent => {
                // метод find позволяет найти пользователя в массиве users
                return users.find(u => u.login === parent.owner)
            },
            taggedUsers: parent => {
                return tags
                    // возвращает массив тегов, которые содержат только
                    //      текущую фотографию
                    .filter(tag => tag.photoID === parent.id)
                    // преобразует массив тегов в массив значений userLogin
                    .map(tag => tag.userLogin)
                    // преобразует массив значений userLogin в массив объектов
                    //      пользователей
                    .map(userLogin => users.find(u => u.login === userLogin))
            }
        },
        User: {
            postedPhotos: parent => {
                // метод filter возвращает массив фотографий
                return photos.filter(p => p.owner === parent.login)
            },
            inPhotos: parent => {
                return tags
                    // возвращает массив тегов, которые содержат
                    //      только текущего пользователя
                    .filter(tag => tag.userLogin === parent.login)
                    // преобразует массив тегов в массив значений photoID
                    .map(tag => tag.photoID)
                    // преобразует массив значений photoID в массив объектов
                    //      фотографий
                    .map(photoID => photos.find(p => p.id === photoID))
            }
        }
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // GraphQL не требует, чтобы модели данных точно соответствовали типам в схеме.
    //      Клиентам не нужно запрашивать тип Tag, поэтому он отсутствует в схеме.

    // Запрос на все фото с перечислением всех пользователей на фото.
    await clientRequest(url,
        `
            query listPhotos {
                allPhotos {
                    url
                    taggedUsers {
                        name
                    }
                }
            }
        `
    ).catch((err) => console.log('--- --- I --- ---', err));

    server.stop();
}

// --- 4.5 Пользовательские скаляры.

// GraphQL содержит стандартные скалярные типы: Int, Float, String, Boolean, ID.
//      GraphQL позволяет создавать собственные скалярные типы в соответствии
//      с требованиями к данным. Для пользовательского скаляра следует указать
//      правила сериализации и проверки типа.

async function require_7() {

    console.log('--- --- --- пользовательские скаляры --- --- ---');

    // В схеме поле created используется для хранения даты и времени. Для типа
    //      DateTime следует определить допустимые значения DateTime. Для поля
    //      Photo.created следует указать распознаватель типа DateTime.
    const typeDefs = `
        # --- скалярный тип
        scalar DateTime

        # --- объект фото
        type Photo {
            id: ID!
            url: String!
            name: String!
            description: String
            created: DateTime!
        }
        
        # --- корневой тип запросов
        type Query {
            allPhotos(after: DateTime): [Photo!]!
        }

        # --- корневой тип мутаций
        type Mutation {
            postPhoto(name: String! description: String): Photo!
        }
    `;

    // 
    let autoID = 0;
    let photos = [];

    // Для обработки значений DateTime требуются все три функции.
    const resolvers = {
        Query: {
            // аргумент даты: args.after
            allPhotos: (parent, args, context) => {
                console.log(args.after, ' --- ', context);
                context.last = args.after;
                return photos;
            }
        },
        Mutation: {
            postPhoto(parent, args) {
                let newPhoto = {
                    id: autoID++,
                    name: args.name,
                    description: args.description,
                    // добавление текущей временной метки к фотографии при отправке
                    created: new Date()
                }
                photos.push(newPhoto);
                return newPhoto;
            }
        },
        // 
        Photo: {
            url: (parent) => `http://site.com/img/${parent.id}.jpg`,
        },
        // объект GraphQLScalarType используется для создания распознавателей
        //      пользовательских скаляров
        DateTime: new GraphQLScalarType({
            name: 'DateTime',
            description: 'A valid date time value.',
            // при создании скалярного типа необходимо определить функции [serialize,
            //      parseValue, parseLiteral], которые будут обрабатывать поля и
            //      аргументы, реализующие скаляр
            parseValue: (value) => {
                // Функция parseValue преобразует входящую строку в объект Date.
                return new Date(value);
            },
            serialize: (value) => {

                // Любая из строк может использоваться для создания объектов datetime.
                //      console.log((new Date("Tuesday March")).toString());
                //      console.log((new Date("4/18/2018")).toISOString());
                //      console.log((new Date("4/18/2018 1:30:00 PM")).toISOString());
                //      console.log((new Date("Sun Apr 15 2018 12:10:17 GMT-0700 (PDT)")).toISOString());
                //      console.log((new Date("2018-04-15T19:09:57.308Z")).toISOString());

                // Функция serialize сериализует входящую строку в дату фомата ISO.
                //      Если поле Photo.created содержит допустимую строку даты, то
                //      функция вернет строку в ISO формате.
                return new Date(value).toISOString();
            },
            parseLiteral: (ast) => {

                // Аргумент after добавляется непосредственно в документ запроса.
                //      Значение after следует получить из запроса после его
                //      преобразования в АСД.

                // Функция parseLiteral возвращает нужное значение из документа запроса.
                return ast.value;
            }
        })
    }

    // создать сервер
    const { server, url } = await createServer(typeDefs, resolvers);

    // 
    server.context = {
        last: new Date("6/23/2015")
    }

    // Мутация для добавления фото.
    await clientRequest(url,
        `
            mutation newPhoto($name: String!, $description: String) {
                postPhoto(name: $name, description: $description) {
                    name
                    url
                }
            }
        `,
        {
            "name": "sample photo B",
            "description": "sample description"
        }
    ).catch((err) => console.log('--- --- I --- ---', err));

    // Запрос с использованием переменной запроса типа DateTime.
    await clientRequest(url,
        `
            query recentPhotos($after:DateTime) {
                allPhotos(after: $after) {
                    name
                    url
                }
            }
        `,
        {
            "after": "4/18/2018",
        }
    ).catch((err) => console.log('--- --- II --- ---'));

    // Запрос с передачей строки даты.
    await clientRequest(url,
        `
            query {
                allPhotos(after: "4/18/2018") {
                    name
                    url
                }
            }
        `
    ).catch((err) => console.log('--- --- III --- ---', err));

    // Запрос списка фото с датой в формате ISO.
    await clientRequest(url,
        `
            query listPhotos {
                allPhotos {
                    name
                    created
                }
            }
        `
    ).catch((err) => console.log('--- --- IV --- ---', err));

    server.stop();
}

// --- 4.6 Сервер apollo-server-express.

// установить Express и Apollo Server Express:
//      npm install apollo-server-express express

// установить пакет для тестирования в GraphQL Playground:
//      npm install graphql-playground-middleware-express

// Код можно переместить в отдельные файлы:
//      - typeDefs.graphql для схемы;
//      - resolvers.js для распознавателей.

async function require_8() {
    return new Promise(async (resolve, reject) => {

        console.log('--- --- --- Playground --- --- ---');

        // использование модуля fs для чтения файла typeDefs.graphql
        const typeDefs = readFileSync(path.join(__dirname, './example_4_8/typeDefs.graphql'), 'UTF-8');
        const resolvers = require('./example_4_8/resolvers');
        const server = new ApolloServerExpress({ typeDefs, resolvers });
        await server.start();

        // создать приложение Express
        let app = express();

        // добавить промежуточное ПО
        server.applyMiddleware({ app });

        // Сервер будет настроен на запуск Apollo Server Express с тремя маршрутами:
        //      /                корневой маршрут
        //      /graphql         конечная точка GraphQL
        //      /playground      GraphQL Playground

        // создать корневой маршрут
        app.get('/', (req, res) => {
            res.end('Welcome!');
        });

        // маршрут для тестирования через Playground:
        //      http://localhost:4000/playground
        app.get('/playground',
            expressPlayground({ endpoint: '/graphql' })
        );

        // запуск сервера
        app.listen({ port: 4000 }, () => {
            console.log(`--- GraphQL Service: http://localhost:4000${server.graphqlPath}`);
        })

    });
}

// --- 4.7 Контекст.

// Контекст - это контейнер для хранения информации необходимой приложению:
//      данные об аутентификации, база данных, локальный кэш данных.

// В соответствии с принципом SRP (Single Responsibility Principle) в контекст
//      помещается объект, который инкапсулирует работу с REST API или базой
//      данных.

async function createExpressServer(typeDefs, resolvers, context) {
    return new Promise(async (resolve, reject) => {

        // передать контекст 
        const server = new ApolloServerExpress({ typeDefs, resolvers, context });

        // 
        await server.start();
        let app = express();
        server.applyMiddleware({ app });

        // маршруты
        app.get('/', (req, res) => res.end('Welcome!'));
        app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

        // запуск сервера
        app.listen({ port: 4000 }, () => {
            console.log(`--- GraphQL Service: http://localhost:4000${server.graphqlPath}`);
            resolve({
                server: server,
                url: `http://localhost:4000${server.graphqlPath}`
            });
        })
    });
}

async function require_9() {

    console.log('--- --- --- контекст --- --- ---');

    // 
    const typeDefs = readFileSync(path.join(__dirname, './example_4_9/typeDefs.graphql'), 'UTF-8');
    const resolvers = require('./example_4_9/resolvers');

    // создать сервер
    //      const { server, url } = await createExpressServer(typeDefs, resolvers, context);
    const { server, url } = await createServer(typeDefs, resolvers);

    // создать контекст
    server.context = {
        autoID: 0,
        photos: []
    };

    // Мутация создания Photo.
    await clientRequest(url,
        `
            mutation newPhoto($name: String!, $description: String) {
                postPhoto(name: $name, description: $description) {
                    id
                    name
                    description
                }
            }
        `,
        {
            "name": "sample photo B",
            "description": "sample description"
        }
    ).catch((err) => console.log('--- --- I --- ---', err));

    // Запрос массива объектов Photo.
    await clientRequest(url,
        `
            query listPhotos {
                allPhotos {
                    id
                    name
                    description
                    url
                }
            }
        `
    ).catch((err) => console.log('--- --- II --- ---', err));

    server.stop();
}

// --- 4.8 Abstract syntax tree.

function require_10() {

    // Абстрактное синтаксическое дерево (АСД)
    const abstract_syntax_tree = gql`
        mutation addSkill($id:String!, $name:String!, $level:Float!, $type:String!) {
            addSkill(id:$id, name:$name, level:$level, type:$type) { 
                status
                id
                name
                level
                type
            }
        }
    `;

    // получить строку запроса на основе АСД
    const query = print(abstract_syntax_tree);

    // 
    console.log(`
        --- АСД: ${abstract_syntax_tree}
        --- query: ${query}
    `);
}

// --- Запуск.

module.exports = (example) => {
    if (example === 1) require_1();
    if (example === 2) require_2();
    if (example === 3) require_3();
    if (example === 4) require_4();
    if (example === 5) require_5();
    if (example === 6) require_6();
    if (example === 7) require_7();
    if (example === 8) require_8();
    if (example === 9) require_9();
    if (example === 10) require_10();
}