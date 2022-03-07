"use strict";

// ecstatic - 
//      This package has been deprecated
//      https://www.npmjs.com/package/ecstatic

// ws
//      https://www.npmjs.com/package/ws

//
const http = require('http');
const ws = require('ws');
const ecstatic = require('ecstatic');

// 
async function createServer(port, callback) {
    return new Promise(async (resolve, reject) => {

        // - создается статический HTTP файл-сервер
        // - присоединяется промежуточное ПО ecstatic для обслуживания статических 
        //      файлов: клиентских ресурсов приложения, JavaScript и CSS
        const server = http.createServer(
            ecstatic({ root: `${__dirname}` })
        );

        // создается новый экземпляр сервера сокетов с передачей ему HTTP ­сервера
        const wss = new ws.Server({ server: server });

        // запускается цикл приема входящих соединений
        wss.on('connection', ws => {
            console.log('--- connected');

            // когда к серверу подключается новый клиент, запускается цикл приема 
            //      входящих сообщений
            ws.on('message', msg => {
                console.log(`--- message: ${msg.toString()}`);
                if (msg.toString().endsWith('exit')) {
                    callback();
                }
                else {
                    // когда поступает новое сообщение, оно передается всем подключенным клиентам
                    broadcast(msg);
                }
            });
        });

        // выполняет обход всех подключенных клиентов и для каждого вызывает функцию send
        function broadcast(msg) {
            wss.clients.forEach(client => {
                client.send(msg);
            });
        }

        // 
        server.listen(process.argv[2] || port, () => {
            console.log(`http://localhost:${port}`);
            resolve(server);
        });

        // Запуск:
        //      "ecstatic": "^1.4.0"
        //      "ws": "^1.0.1"
        //      node app
        //      http://localhost:8080
    });
}

// 
module.exports.createServer = createServer;