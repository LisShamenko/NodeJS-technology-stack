"use strict";

console.log(`--- requestor`);

// создание запрашивающей стороны в файле
const childProcess = require('child_process');
const path = require('path');

// 
const childPath = path.join(__dirname, 'replier.js');
const replier = childProcess.fork(childPath); // `${__dirname}/replier.js`

// запрашивающая сторона запускает отвечающую и 
//      передает ей ссылку на абстракцию запросов
const { requestFactory } = require('./request');
const request = requestFactory(replier);

// 
console.log(`--- request: 1 + 2 --- 500ms`);
request(
    { a: 1, b: 2, delay: 500 },
    res => {
        console.log(`--- answer: 1 + 2 = ${res.sum}`);
        // последний запрос закроет соединение
        replier.disconnect();
    }
);

// 
console.log(`--- request: 6 + 1 --- 100ms`);
request(
    { a: 6, b: 1, delay: 100 },
    res => {
        console.log(`--- answer: 6 + 1 = ${res.sum}`);
    }
);