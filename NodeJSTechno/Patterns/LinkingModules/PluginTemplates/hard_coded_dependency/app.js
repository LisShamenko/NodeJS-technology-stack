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
const dirnames = ['30'];

// 
const dbpath30 = path.join(basepath, './30/example-db');



// --------------- 30. Плагин: доступ к службам через жесткие зависимости.

async function modules_hard_coded_dependency() {
    console.log(`
        --- --- --- modules_hard_coded_dependency --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // зависимости
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

        // плагин
        //      чтобы подключить плагин, достаточно просто загрузить его, управление будет 
        //      передано плагину, который осуществит расширение модулей authService и app
        module.exports.app = app;
        require('authsrv-plugin-logout');

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
    const creator = databaseСreator(dbpath30);
    await creator.automation(creator);

    // 
    const { server, authController } = await modules_hard_coded_dependency();

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