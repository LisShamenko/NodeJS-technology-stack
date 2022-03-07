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
const dirnames = ['33'];

// 
const dbpath33 = path.join(basepath, './33/example-db');



// --------------- 33. Плагин: локатор служб.

async function modules_service_locator() {
    console.log(`
        --- --- --- modules_service_locator --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        const db = require('./db');
        const AuthService = require('./authService');
        const AuthController = require('./authController');

        // приложение
        const app = new express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // сервис локатор
        const svcLoc = require('./../../serviceLocator')();
        svcLoc.register('dbName', dbpath33);
        svcLoc.register('tokenSecret', 'a_token_secret');
        svcLoc.factory('db', db);
        svcLoc.factory('authService', AuthService);
        svcLoc.factory('authController', AuthController);
        // регистрируется модуль app, чтобы дать плагину возможность обращаться к нему
        svcLoc.register('app', app);

        // плагин
        const plugin = require('authsrv-plugin-logout');
        // вызов функции плагина и передача ей локатора служб
        plugin(svcLoc);

        // маршрутизация
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
    const creator = databaseСreator(dbpath33);
    await creator.automation(creator);

    // 
    const { server, authController } = await modules_service_locator();

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