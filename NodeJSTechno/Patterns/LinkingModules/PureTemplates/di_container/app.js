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
const dirnames = ['27'];

// 
const dbpath27 = path.join(basepath, './27/example-db');


// --------------- 27. DI-контейнер.

async function di_container() {
    console.log(`
        --- --- --- di_container --- --- ---
    `);
    return new Promise(async (resolve, reject) => {


        // зависимости
        const DIContainer = require('./../../diContainer');
        const DB = require('./db');
        const AuthService = require('./authService');
        const AuthController = require('./authController');

        // DI-контейнер
        const diContainer = DIContainer();
        diContainer.register('dbName', dbpath27);
        diContainer.register('tokenSecret', 'a_token_secret');
        diContainer.factory('db', DB);
        diContainer.factory('authService', AuthService);
        diContainer.factory('authController', AuthController);

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
        //      вызов diContainer.get приводит к загрузке всего графа зависимостей, 
        //      все модули, зарегистрированные в контейнере, будут создаваться и 
        //      подключаться автоматически
        const authController = diContainer.get('authController');
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
    const creator = databaseСreator(dbpath27);
    await creator.automation(creator);

    // 
    const { server, authController } = await di_container();

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