"use strict";

// 
const { WebSocketServer } = require('ws');
const amqp = require('amqplib');
const JSONStream = require('JSONStream');
const request = require('request');
const http = require('http');
const ecstatic = require('ecstatic');

// 
async function createServer(port, historyPort) {
    return new Promise(async (resolve, reject) => {

        // --- args

        //      let port = process.argv[2] || 8080;

        // --- server

        const server = http.createServer(
            ecstatic({ root: `${__dirname}/www` })
        );

        // --- amqp

        let channel, queue;
        amqp
            .connect('amqp://localhost')
            .then(conn => {
                console.log(`--- connect to channel`);
                return conn.createChannel();
            })
            .then(ch => {
                channel = ch;
                return channel.assertExchange('chat', 'fanout');
            })
            .then(() => {
                // для нормальной работы сервера чата не требуется надежная подписка, 
                //      ему достаточно поддержки парадигмы 'отправил и забыл', поэтому 
                //      используется параметр: 'exclusive: true' - очередь предназначена 
                //      только для текущего соединения и ее можно уничтожить, как только 
                //      сервер чата завершит работу
                return channel.assertQueue(`chat_srv_${port}`, { exclusive: true });
            })
            .then(q => {
                queue = q.queue;
                return channel.bindQueue(queue, 'chat');
            })
            .then(() => {

                // 
                return channel.consume(
                    queue,
                    msg => {
                        msg = msg.content.toString();
                        console.log(`--- queue: ${msg}`);
                        broadcast(msg);
                    },
                    { noAck: true }
                );
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });

        // --- WSS

        //
        const wss = new WebSocketServer({ server: server });

        //
        wss.on('connection', ws => {
            console.log('--- connected');

            //query the history service
            request(`http://localhost:${historyPort}`)
                .on('error', err => {
                    console.log(`--- err = ${err}`);
                })
                .pipe(JSONStream.parse('*'))
                .on('data', msg => {
                    console.log(`--- request data: ${msg.toString()}`);
                    ws.send(msg);
                });

            //
            ws.on('message', msg => {
                console.log(`--- message: ${msg.toString()}`);

                // публикация нового сообщения упрощается: достаточно указать целевой 
                //      коммутатор 'chat' и ключ маршрутизации, который в данном случае 
                //      является пустой строкой, потому что используется разветвляющий 
                //      коммутатор
                channel.publish('chat', '', msg);
            });
        });

        //
        function broadcast(msg) {
            wss.clients.forEach(client => client.send(msg));
        }

        // --- listen

        //
        server.listen(port, () => {
            console.log(`--- http://localhost:${port}`);
            resolve(server);
        });
    });
}

// 
module.exports.createServer = createServer;

// Запуск:
//      "JSONStream": "^1.1.1"
//      "amqplib": "^0.4.1"
//      "ecstatic": "^1.4.0"
//      "level": "^1.4.0"
//      "monotonic-timestamp": "0.0.9"
//      "request": "^2.70.0"
//      "ws": "^1.0.1"
//      node app 8080
//      node app 8081
//      node historySvc
//      http://localhost:8080
//      http://localhost:8081