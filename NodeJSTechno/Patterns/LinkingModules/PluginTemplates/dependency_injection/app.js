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
const dirnames = ['31'];

// 
const dbpath31 = path.join(basepath, './31/example-db');



// --------------- 31. Плагин: инверсия зависимостей.

async function modules_dependency_injection() {
    console.log(`
        --- --- --- modules_dependency_injection --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        const dbFactory = require('./db');
        const authServiceFactory = require('./authService');
        const authControllerFactory = require('./authController');

        // фабрика
        const db = dbFactory(dbpath31);
        const authService = authServiceFactory(db, 'a_token_secret');
        const authController = authControllerFactory(authService);

        // приложение
        const app = new express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // плагин
        require('./../authsrv-plugin-logout')(app, authService, db);

        // маршрутизация
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
    const creator = databaseСreator(dbpath31);
    await creator.automation(creator);

    // 
    const { server, authController } = await modules_dependency_injection();

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