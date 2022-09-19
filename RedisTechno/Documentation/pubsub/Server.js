"use strict";

const redis = require("redis");
const { WebSocketServer } = require('ws');
const http = require('http');

// 
async function createServer(port, callback) {
    return new Promise(async (resolve, reject) => {

        // 
        const redisPub = redis.createClient({ url: process.env.REDIS_URL });
        await redisPub.connect();

        // 
        const redisSub = redisPub.duplicate();
        await redisSub.connect();

        // 
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: 'Hello World!' }));
        });

        // 
        const wss = new WebSocketServer({ server: server });

        // 
        wss.on('connection', (ws) => {
            console.log('--- connected');

            // 
            ws.on('message', async msg => {
                console.log(`--- message: ${msg.toString()}`);

                // 
                await redisPub.publish('chat_messages', msg.toString());
            });
        });

        // 
        redisSub.subscribe('chat_messages', (message) => {
            wss.clients.forEach((client) => {
                client.send(message);
            });
        });

        //
        server.listen(port, () => {
            console.log(`http://localhost:${port}`)
            resolve();
        });
    });
}

// 
module.exports.createServer = createServer;