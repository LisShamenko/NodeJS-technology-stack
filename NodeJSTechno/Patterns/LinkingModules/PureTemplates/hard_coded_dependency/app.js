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
const dirnames = ['25'];

// 
const dbpath25 = path.join(basepath, './25/example-db');



// --------------- 25. Жесткие зависимости.

async function hard_coded_dependency() {
    console.log(`
        --- --- --- hard_coded_dependency --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
        //      вызов require создает жесткую зависимость 
        //      от экземпляра с состоянием
        const authController = require('./authController');

        // приложение
        //      ­сервер express регистрирует промежуточное 
        //      программное обеспечение
        let app = new express();
        app.use(express.json({
            type: 'application/json'
        }));
        app.use(express.urlencoded({
            extended: true,
            type: 'application/x-www-form-urlencoded',
        }));

        // маршрутизация
        //      два маршрута, экспортируемых модулем authController
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
    const creator = databaseСreator(dbpath25);
    await creator.automation(creator);

    // 
    const { server, authController } = await hard_coded_dependency();

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