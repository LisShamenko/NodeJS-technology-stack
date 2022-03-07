"use strict";

// Koa 
//      http://koajs.com/
const Koa = require('koa');
const http = require('http');


// --------------- 23. Промежуточное программное обеспечение (middleware).

// --- 23.1 Koa.

// koajs/ratelimit - полноценная надежная реализациия ограничения частоты запросов
//      https://github.com/koajs/ratelimit.

// koajs/compose - реализация шаблона 'промежуточного программного обеспечения' 
//      на базе генераторов. Модуль для преобразования массива генераторов в новый 
//      генератор, выполняющий оригинальные генераторы в конвейере:
//      https://github.com/koajs/compose

// 
function middleware_koa() {
    console.log(`
        --- --- --- middleware_koa --- --- ---
    `);

    // Запуск:
    //      npm install koa
    //      node app.js
    //      http://localhost:3000

    // Входящий запрос проходит через несколько промежуточных уровней ПО прежде 
    //      чем попадает в ядро приложения. После достижения ядра поток проходит 
    //      все промежуточные уровни в обратном порядке, что позволяет выполнить 
    //      дополнительные действия перед отправкой ответа пользователю. 

    // сохраняет время получения последнего вызова по IP ­адресу, используется 
    //      для проверки частоты поступления запросов от пользователей, в реальном 
    //      приложении вместо этого используются Redis или Memcache
    const lastCall = new Map();

    // ПО на основе генератора
    const rateLimit = function* (next) {

        // inbound - входящая часть потока выполняется до ядра приложения, поэтому 
        //      здесь проверяется превышение ограничения частоты вызовов
        const now = new Date();
        if (lastCall.has(this.ip) && now.getTime() - lastCall.get(this.ip).getTime() < 1000) {
            // Too Many Requests
            return this.status = 429;
        }

        // переход к следующему слою приложения, оператор yield приостанавливает 
        //      выполнение генератора и передает управление следующему слою ПО, 
        //      обратный поток вполнения начинается после выполнения последнего 
        //      слоя (ядра приложения) 
        yield next;

        // outbound - исходящая часть потока
        lastCall.set(this.ip, now);

        // заголовок X-RateLimit-Reset оповещает о том, когда можно будет сделать 
        //      новый запрос
        this.set('X-RateLimit-Reset', now.getTime() + 1000);
    };

    // ядро приложения определяется как функция­ генератор в методе app.use
    const app = new Koa();
    app.use(rateLimit);
    app.use(function* () {
        this.body = { "now": new Date() };
    });
    const server = app.listen(3000);
    return server;
}

// 
async function sendRequest() {
    return new Promise((resolve, reject) => {

        // 
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET',
        };

        // запрос на сервер
        const req = http.request(options, res => {
            console.log(`--- server response: ${res.statusCode}`);
            res.on('data', (chunk) => {
                console.log(`--- body: ${chunk}`);
            });
            res.on('end', () => {
                console.log('--- end');
                resolve();
            });
        });
        req.on('error', (err) => {
            console.log(`--- err = ${err}`);
            reject();
        });
        req.end();
    });
}

// --- Запуск.

// 
(async () => {
    const server = middleware_koa();
    await sendRequest();
    server.close();
})();