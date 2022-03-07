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
const dirnames = ['26'];

// 
const dbpath26 = path.join(basepath, './26/example-db');



// --------------- 26. Инверсия зависимостей.

async function dependency_injection() {
    console.log(`
        --- --- --- dependency_injection --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        //      загружаются фабрики служб, которые являются объектами без состояния
        const dbFactory = require('./db');
        const authServiceFactory = require('./authService');
        const authControllerFactory = require('./authController');

        // фабрика
        // - создаются экземпляры служб с передачей необходимых зависимостей, 
        //      на этом этапе создаются и соединяются вместе все модули
        // - все зависимости создаются и связываются в компоненте верхнего уровня, 
        //      в модуле app, который является менее многоразовым и более всего 
        //      подходит для организации связывания
        const db = dbFactory(dbpath26);
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

        // маршрутизация
        //      маршруты для модуля authController регистрируются как обычно
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
    const creator = databaseСreator(dbpath26);
    await creator.automation(creator);

    // 
    const { server, authController } = await dependency_injection();

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