"use strict";

// ZMQ установка:
//      npm install zeromq@6.0.0-beta.6

// zmq
//      https://npmjs.org/package/zmq
//      npm install zeromq@6.0.0-beta.6
//          рабочая установка

// minimist
//      https://npmjs.org/package/minimist

// --- пример 

//      const zmq = require("zeromq/v5-compat")
//      const pub = zmq.socket("pub")
//      const sub = zmq.socket("sub")
//      sub.on("message", msg => {
//          console.log(msg);
//      })
//      pub.bind("tcp://*:3456", err => {
//          if (err) throw err
//          sub.connect("tcp://127.0.0.1:3456")
//          pub.send("message")
//          pub.send("message")
//          pub.send("message")
//      })

// --- пример

// 
const { WebSocketServer } = require('ws');
// пакет zmq является интерфейсом подключения библиотеки ØMQ 
const zmq = require("zeromq/v5-compat");
// пакет minimist для парсинга аргументов командной строки 
const minimist = require('minimist');
const http = require('http');
const ecstatic = require('ecstatic');

// --- args

// 
const args = minimist(process.argv.slice(2));
console.log(`
    --- --- --- minimist
    --- : ${process.argv}
    --- args 1: ${JSON.stringify(args)}
    --- args 2: ${args['port']}
    --- args 3: ${args['pub']}
    --- args 4: ${args['sub']}
`);

// --- server

// static file server
const server = http.createServer(
    ecstatic({ root: `${__dirname}/www` })
);

// --- ZMQ

// создается сокет PUB и подключается к порту, извлеченному
//      из аргумента командной строки --pub
const pubSocket = zmq.socket('pub');
pubSocket.bind(`tcp://127.0.0.1:${args['pub']}`);
console.log(`--- pub socket bind --- tcp://127.0.0.1:${args['pub']}`);

// создается сокет SUB
const subSocket = zmq.socket('sub');

// порты целевых сокетов PUB извлекаются из аргументов --sub командной строки
const subPorts = [].concat(args['sub']);
subPorts.forEach(p => {
    // сокет SUB подключается к сокетам PUB других экземпляров приложения
    subSocket.connect(`tcp://127.0.0.1:${p}`);
    console.log(`--- sub socket connect --- tcp://127.0.0.1:${p}`);
});

// создаются нужные подписки со строкой chat в качестве фильтра, то есть
//      будут приниматься только сообщения, начинающиеся с префикса chat
subSocket.subscribe('chat');
console.log(`--- sub socket subscribe --- chat`);

// начинается прием сообщений, поступающих на сокет SUB
subSocket.on('message', msg => {
    console.log(`--- sub socket on --- message: ${msg}`);

    // из принятых сообщений удаляется префикс chat
    let split_messages = msg.toString().split(' ');
    let no_prefix = split_messages[1];

    // сообщения рассылаются всем клиентам, подключенным к серверу веб­сокета
    broadcast(no_prefix);
});

// --- WSS

//
const wss = new WebSocketServer({ server: server });

// прием соединений
wss.on('connection', ws => {
    console.log('--- connected');

    // веб­сокет принимает новое сообщение
    ws.on('message', msg => {
        console.log(`--- message: ${msg.toString()}`);

        // сообщение передается всем подключенным клиентам
        broadcast(msg);

        // сообщение публикуется в сокет PUB, перед этим в начало сообщения добавляются
        //      строка chat и пробел, благодаря этому его примут все подписчики,
        //      использующие строку chat в качестве фильтра
        pubSocket.send(`chat ${msg}`);
    });
});

//
function broadcast(msg) {
    wss.clients.forEach(client => {
        client.send(msg);
    });
}

// --- listen

//
server.listen(args['port'] || 8080, () => console.log('--- server strt'));

// Запуск:
//      http://zeromq.org/intro:get-the-software
//      "ecstatic": "^1.4.0"
//      "minimist": "^1.2.0"
//      "ws": "^1.0.1"
//      "zmq": "^2.14.0"
//      node app --port 8080 --pub 5000 --sub 5001 --sub 5002
//      node app --port 8081 --pub 5001 --sub 5000 --sub 5002
//      node app --port 8082 --pub 5002 --sub 5000 --sub 5001
//      http://localhost:8080
//      http://localhost:8081
//      http://localhost:8082