"use strict";

// redis - полноценный клиент, поддерживающий все доступные команды Redis
//      https://npmjs.org/package/redis

// для подключения к серверу Redis используется пакет redis
const redis = require("redis");
const { WebSocketServer } = require('ws');
const http = require('http');
const ecstatic = require('ecstatic');

// ошибка:
//      UnhandledPromiseRejectionWarning: ReferenceError: queueMicrotask is not defined
//      at RedisSocket.cork (/home/lis/Projects/currents/4/node_modules/@node-redis/client/dist/lib/client/socket.js:86:9)
//      at Commander._RedisClient_tick (/home/lis/Projects/currents/4/node_modules/@node-redis/client/dist/lib/client/index.js:431:60)
//      at RedisSocket.socket_1.default.on.on.on.on (/home/lis/Projects/currents/4/node_modules/@node-redis/client/dist/lib/client/index.js:350:86)
//      at RedisSocket.emit (events.js:198:13)
//      at RedisSocket._RedisSocket_connect (/home/lis/Projects/currents/4/node_modules/@node-redis/client/dist/lib/client/socket.js:143:10)
//      at process._tickCallback (internal/process/next_tick.js:68:7)
//
// решение:
//      добавить в файл './node_modules/@node-redis/client/dist/lib/client/socket.js' 
//      следующее объявление из пакета 'queue-microtask':
//          const queueMicrotask = require('queue-microtask');

// 
async function createServer(port, callback) {
    return new Promise(async (resolve, reject) => {

        // Создаются два соединения: для подписки на канал и для публикации сообщений.
        //      После перевода соединения в режим подписки к нему можно применять только 
        //      команды, относящиеся к подписке. Необходимо еще одно соединение 
        //      для публикации сообщений.
        const redisPub = redis.createClient();
        await redisPub.connect();
        const redisSub = redisPub.duplicate();
        await redisSub.connect();

        // 
        const server = http.createServer(
            ecstatic({ root: `${__dirname}/www` })
        );

        // 
        const wss = new WebSocketServer({ server: server });

        // прием соединений
        wss.on('connection', (ws) => {
            console.log('--- connected');

            // прием сообщений
            ws.on('message', async msg => {
                console.log(`--- message: ${msg.toString()}`);

                // новые сообщения публикуются в канале chat_messages, сообщения 
                //      не рассылаются клиентам непосредственно, поскольку сервер 
                //      подписан на тот же самый канал, оно будет возвращаться 
                //      через службу Redis
                await redisPub.publish('chat_messages', msg.toString());
            });
        });

        // подписка на канал чата и регистрация обработчика сообщений поступающих 
        //      в канал
        redisSub.subscribe('chat_messages', (message) => {
            // полученное сообщение рассылается всем клиентам, подключенным 
            //      к веб­сокету текущего сервера
            wss.clients.forEach((client) => {
                client.send(message);
            });
        });

        // устаревшая версия:
        //      redisSub.subscribe('chat_messages');
        //      redisSub.on('message', (channel, msg) => {
        //          wss.clients.forEach((client) => client.send(msg));
        //      });

        //
        server.listen(port, () => {
            resolve();
        });

        // Запуск:
        //      "ecstatic": "^1.4.0"
        //      "redis": "^2.6.0-1"
        //      "ws": "^1.0.1"
        //      node app 8081
        //      node app 8082
        //      http://localhost:8081
        //      http://localhost:8082
    });
}

// 
module.exports.createServer = createServer;