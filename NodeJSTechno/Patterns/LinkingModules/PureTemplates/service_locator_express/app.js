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
const dirnames = ['29'];

// 
const dbpath29 = path.join(basepath, './29/example-db');



// --------------- 29. Локатор служб Express.

async function service_locator_express() {
    console.log(`
        --- --- --- service_locator_express --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        const db = require('./db');
        const authService = require('./authService');
        const authController = require('./authController');

        // приложение
        const app = new express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // экземпляр express используется в качестве сервиса локаторов (service locator)
        app.set('dbName', dbpath29);
        app.set('tokenSecret', 'a_token_secret');
        app.set('db', db(app));
        app.set('authService', authService(app));

        // маршрутизация
        app.post('/login', authController.login);
        app.get('/checkToken', authController.checkToken);

        // постобработка
        app.use(errorHandler());

        // запуск
        const server = http.createServer(app).listen(3000, () => {
            console.log('--- server: http://localhost:3000');
            resolve({ app, server, authController });
        });
    });
}

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    // 
    const creator = databaseСreator(dbpath29);
    await creator.automation(creator);

    // 
    const { app, server, authController } = await service_locator_express();

    // 
    let result = null;
    result = await authController.get_user(app, 'first');
    result = await authController.get_user(app, 'second');
    result = await authController.get_user(app, 'third');

    // 
    let postResult = await postLogin('first', 'secret_foo');
    console.log(`--- postLogin --- first's token: ${postResult.body.token}`);
    let getResult = await getCheckToken(postResult.body.token);
    console.log(`--- checkToken --- body: ${getResult.body}`);

    //
    server.close();
})();