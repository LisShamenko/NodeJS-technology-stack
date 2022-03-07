"use strict";

console.log(`--- amqpRequest`);

// 
const req = require('./amqpRequest')();

// в результате запрашивающая сторона опубликует набор операций, который 
//      затем будет получен отвечающей стороной, которая вернет ответы
req.initialize().then(() => {
    console.log(`--- AMQPRequest: then before promise's initialize`);

    // 
    for (let i = 100; i > 0; i--) {
        sendRandomRequest();
    }
});

// 
function sendRandomRequest() {
    const a = Math.round(Math.random() * 100);
    const b = Math.round(Math.random() * 100);

    // достаточно указать имя очереди ответов в свойствах сообщения, что 
    //      позволит отвечающей стороне узнать, куда послать сообщение с ответом
    req.request(
        'requests_queue',
        { a: a, b: b },
        res => {
            console.log(`--- ${a} + ${b} = ${res.sum}`);
        }
    );
}

// Запуск:
//    "amqplib": "^0.4.1"
//    "node-uuid": "^1.4.7"
//    node replier
//    node requestor