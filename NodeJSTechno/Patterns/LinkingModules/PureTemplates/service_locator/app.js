"use strict";

// библиотеки
const path = require('path');
const express = require('express');
const errorHandler = require('errorhandler');
const http = require('http');

// 
const databaseСreator = require('./../../databaseСreator');
const { getCheckToken, postLogin } = require('./../../auth_requests');

// 
const { mkdirs } = require('./../../../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../../../dist');
const dirnames = ['28'];

// 
const dbpath28 = path.join(basepath, './28/example-db');


// --------------- 28. Локатор служб.

async function service_locator() {
    console.log(`
        --- --- --- service_locator --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        //       создается новый локатор служб
        const svcLoc = require('./../../serviceLocator')();
        const db = require('./db');
        const AuthService = require('./authService');
        const AuthController = require('./authController');

        // сервис локатор
        //      параметры конфигурации и фабрики модулей регистрируются
        //      в локаторе служб, но экземпляры зависимостей еще не созданы
        svcLoc.register('dbName', dbpath28);
        svcLoc.register('tokenSecret', 'a_token_secret');
        svcLoc.factory('db', db);
        svcLoc.factory('authService', AuthService);
        svcLoc.factory('authController', AuthController);

        // приложение
        const app = new express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // маршрутизация
        //      точка входа для создания всего графа зависимостей, при получении 
        //      экземпдяра компонента authController, локатор служб вызывает 
        //      связанную фабрику, внедряя себя, затем фабрика модуля authController 
        //      загружает модуль authService, который создает модуль db
        const authController = svcLoc.get('authController');
        app.post('/login', authController.login);
        app.get('/checkToken', authController.checkToken);

        // постобработка
        app.use(errorHandler());

        // запуск
        const server = http.createServer(app).listen(3000, () => {
            console.log('--- server: http://localhost:3000');
            resolve({ server, authController });
        });
    });
}

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    // 
    const creator = databaseСreator(dbpath28);
    await creator.automation(creator);

    // 
    const { server, authController } = await service_locator();

    // 
    let result = null;
    result = await authController.get_user('first');
    result = await authController.get_user('second');
    result = await authController.get_user('third');

    // 
    let postResult = await postLogin('first', 'secret_foo');
    console.log(`--- postLogin --- first's token: ${postResult.body.token}`);
    let getResult = await getCheckToken(postResult.body.token);
    console.log(`--- checkToken --- body: ${getResult.body}`);

    //
    server.close();
})();