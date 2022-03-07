"use strict";

const http = require('http');
const { EventEmitter } = require('events');



// --------------- 34. Асинхронная инициализаия модулей.

// Загрузка модулей в NodeJS выполняется синхронно, поскольку функция require 
//      работает синхронно, а атрибут module.exports не может устанавливаться 
//      асинхронно. Но для модулей выполняющих сетевые операции во время 
//      инициализации, например, установка соединения иди запрос конфигурации, 
//      требуется асинхронная загрузка.

// --- 34.1 Канонические решения.

// Модуль DB может начать принимать запросы после завершения подключения 
//      к серверу, поэтому следует удостовериться, что он инициализирован или 
//      дождаться завершения инициализации. 

// модуль инициализации базы данных
class DB extends EventEmitter {
    constructor(delay) {
        super();
        console.log(`--- new DB(delay = ${delay}) --- ${new Date()}`);

        // имитация отложенного подключения базы данных
        this.connected = false;
        setTimeout(() => {
            this.connected = true;
            this.emit('connected');
        }, delay);
    }

    // запрос выполняется если есть соединение с БД
    findAll(type, callback) {
        if (this.connected) {
            callback(`findAll: ${type}`);
        }
    }
}

// Модуль DB может начать принимать запросы после завершения подключения к серверу,
//      поэтому нужна проверка перед каждой операцией в асинхронном модуле. Если 
//      модуль не инициализирован, то следует дождаться завершения инициализации,
//      данный вариант содержит большое количества типового кода.

// модуль с функцией инкапсулирующей выполнение целевого метогда
function DBWrap(db) {
    return {
        findAll: (type, callback) => {

            // проверка в каждой функции
            if (db.connected) {
                // если есть соединение, то выполнить метод немедленно
                runFind();
            }
            else {
                // если соединения нет, то ожидать события подключения
                db.once('connected', runFind);
            }

            // выполнить целевой метод 
            function runFind() {
                db.findAll(type, callback);
            }
        }
    }
}

// применение шаблона 'функция-обёртка'
async function wrapper_function() {
    console.log(`
        --- --- --- wrapper_function --- --- ---
    `);
    return new Promise(async (resolve, reject) => {
        const db = new DB(500);
        let dbWrap = DBWrap(db);
        dbWrap.findAll('db wrap function', (result) => {
            console.log(`--- ${result}`);
            resolve();
        });
    });
}

// загрузка модуля при помощи DI позволяет задержать инициализацию модуля, пока 
//      асинхронные зависимости не будут полностью инициализированы, этот способ 
//      может стать чрезмерно сложным, если реализуется вручную, но есть DI ­контейнеры, 
//      поддерживающие асинхронную инициализацию модулей

// модуль с фабрикой 
function DBFactory(db) {
    // модуль db гарантированно инициализуется
    return function findAll(type, callback) {
        db.findAll(type, callback);
    }
}

// применение шаблона 'фабрика'
async function factory_function() {
    console.log(`
        --- --- --- factory_function --- --- ---
    `);
    return new Promise(async (resolve, reject) => {
        const db = new DB(1000);
        db.on('connected', function () {
            const dbFactory = DBFactory(db);
            dbFactory('db factory function', (result) => {
                console.log(`--- result: ${result} --- ${new Date()}`);
                resolve();
            });
        });
    });
}

// --- 34.2 Очереди на инициализацию.

// Шаблон 'Очередь на инициализацию' - этот шаблон использует очередь и шаблон 'Команда',
//      чтобы исключить проверку инициализации зависимостей. Вызовы всех операции на 
//      не инициализированном компоненте сохраняются в очередь до момента завершения
//      инициализации, после чего выполняются при обработке очереди в цикле.

// Шаблон 'Очередь на инициализацию' - если модуль инициализируется асинхронно, операции 
//      помещаются в очередь, пока инициализация не завершится. Для асинхронного модуля
//      создается прокси, чтобы добавить поддержку очереди, так как обычно код модуля 
//      недоступен для изменений.

// --- 34.3 Сборка с ошибкой.

// 
async function initialization_with_error() {
    console.log(`
        --- --- --- initialization_with_error --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // Модуль asyncModule еще не инициализирован на момент попытки использовать его.
        //      Обычно нескольким неудачным запросам не уделяется особого внимания или 
        //      инициализация выполняется очень быстро и практически не приводит к ошибкам.
        //      Это недопустимо в высоконагруженных приложениях и облачных серверах, 
        //      поддерживающих автоматическое масштабирование.

        const AsyncModuleFactory = require('./AsyncInit/AsyncModuleFactory');
        let asyncModule = AsyncModuleFactory(500);

        // запускает инициализацию модуля asyncModule
        asyncModule.initialize(() => {
            console.log('--- init complete');
            resolve();
        });

        // вызов приводящий к ошибке
        try {
            asyncModule.echo((err, message) => {
                if (err) console.log(`--- err = ${err}`);
                console.log(`--- echo: ${message}`);
            });
        }
        catch (err) {
            console.log(`--- err = ${err}`);
        }
    });
}

// --- 34.4 Сборка на основе очереди.

// 
function RoutesFactory(asyncModule) {
    return {
        echo: (req, res) => {
            // отсутствует проверка инициализации модуля asyncModule, 
            //      что приведет к возникновению проблем
            asyncModule.echo((err, message) => {
                if (err) {
                    res.writeHead(500);
                    return res.end(`--- err = ${err}`);
                }

                // запись результата в HTTP­ ответ
                res.writeHead(200);
                res.end(`--- echo: ${message}`);
            });
        }
    }
}

// 
async function AppFactory(asyncModule, routes) {
    return new Promise(async (resolve, reject) => {

        // запускает инициализацию модуля asyncModule
        asyncModule.initialize(() => {
            console.log('--- init complete');
        });

        // HTTP­ сервер для обработки запроса с помощью routes.echo
        const server = http.createServer(
            (req, res) => {
                if (req.method === 'GET' && req.url === '/echo') {
                    return routes.echo(req, res);
                }
                res.writeHead(404).end('Not found!');
            }
        ).listen(
            8000,
            () => {
                console.log('--- server: http://localhost:8000');
                resolve(server);
            });
    });
}

// 
async function initialization_queue() {
    console.log(`
        --- --- --- initialization_queue --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        const asyncModuleWrapper = require('./AsyncInit/asyncModuleWrapper');
        const routes = RoutesFactory(asyncModuleWrapper);
        const server = await AppFactory(asyncModuleWrapper, routes);

        // 
        let i = 0;
        const check = (message) => {
            console.log(`${message} --- ${new Date()}`);
            if (++i >= 3) {
                server.close();
                resolve();
            }
        };

        // 
        asyncModuleWrapper.initialize(() => {
            check('ok');
        });
        asyncModuleWrapper.echo((err, date) => {
            check(`err = ${err} --- date = ${date}`);
        });
        asyncModuleWrapper.echo((err, date) => {
            check(`err = ${err} --- date = ${date}`);
        });
    });
}

// --- 34.5 Реальное применение

// Рассмотренный шаблон используют драйверы баз данных и ORM­ библиотеки.

// Mongoose - ORM ­библиотека для MongoDB. 
//      http://mongoosejs.com

// --- Запуск.

(async () => {
    await wrapper_function();
    await factory_function();
    await initialization_with_error();
    await initialization_queue();
})();