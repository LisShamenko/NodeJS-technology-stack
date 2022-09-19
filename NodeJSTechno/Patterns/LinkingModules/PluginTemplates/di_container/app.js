"use strict";

// библиотеки
const path = require('path');
const express = require('express');
const errorHandler = require('errorhandler');
const http = require('http');

// 
const databaseСreator = require('./../../databaseСreator');
const { getCheckToken, postLogin, getLogout } = require('./../../auth_requests');

// 
const { mkdirs } = require('./../../../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../../../dist');
const dirnames = ['32'];

// 
const dbpath32 = path.join(basepath, './32/example-db');



// --------------- 32. Плагин: DI-контейнер.

async function modules_di_container() {
    console.log(`
        --- --- --- modules_di_container --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        const DIContainer = require('./../../diContainer');
        const DB = require('./db');
        const AuthService = require('./authService');
        const AuthController = require('./authController');

        // приложение
        const app = express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // DI-контейнер
        const diContainer = DIContainer();
        diContainer.register('dbName', dbpath32);
        diContainer.register('tokenSecret', 'a_token_secret');
        diContainer.register('app', app);
        diContainer.factory('db', DB);
        diContainer.factory('authService', AuthService);
        diContainer.factory('authController', AuthController);

        // плагин
        //      любой плагин сможет загрузить свой набор зависимостей через 
        //      DI-контейнер без участия родительского приложения
        diContainer.inject(require('./../authsrv-plugin-logout'));

        // маршрутизация
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
    const creator = databaseСreator(dbpath32);
    await creator.automation(creator);

    // 
    const { server, authController } = await modules_di_container();

    // 
    let result = null;
    result = await authController.get_user('first');
    result = await authController.get_user('second');
    result = await authController.get_user('third');

    // 
    let loginResult = await postLogin('first', 'secret_foo');
    console.log(`--- postLogin --- first's token: ${loginResult.body.token}`);
    let checkTokenResult = await getCheckToken(loginResult.body.token);
    console.log(`--- checkToken --- body: ${checkTokenResult.body}`);
    let logoutResult = await getLogout(loginResult.body.token);
    console.log(`--- checkToken --- body: ${logoutResult.body}`);

    //
    server.close();
})();