"use strict";

// 
const http = require('http');
const seaport = require('seaport');

// 
const ports = seaport.connect('localhost', 9090);
const pid = process.pid;
let serviceType = process.argv[2] || 'api-service';

// методы регистрации:
//      registerMeta возвращает полную информацию с id регистрацией сервиса
//      register возвращает только порт
const meta = ports.registerMeta(serviceType);
console.log(`--- meta = ${JSON.stringify(meta)}`);

// 
let counter = 0;
const server = http.createServer(
    (req, res) => {
        for (let i = 1e7; i > 0; i--) { }
        console.log(`--- ${++counter} --- type = ${serviceType} --- pid = ${pid} ---`);
        res.end(`--- ${counter} --- ${serviceType} --- ${pid} ---`);
    }
);

// 
server.listen(
    meta.port,
    () => {
        console.log(`--- server ${pid} --- http://localhost:${meta.port}`);
    }
);

// 
module.exports.server = server;