"use strict";

// 
const http = require('http');

// идентификатор процесса (PID)
const pid = process.pid;
console.log(`--- pid = ${pid}`);

// прослушиваемый порт можно указать с помощью аргумента командной строки, что
//      позволяет запустить несколько экземпляров, прослушивающих разные порты
const port = process.env.PORT || process.argv[2] || 8080;

//
http
    .createServer(
        (req, res) => {
            for (let i = 1e7; i > 0; i--) { }
            console.log(`--- ${pid} / ${purl.query.i} ---`);
            res.end(`--- ${pid} / ${purl.query.i} ---`);
        }
    )
    .listen(
        // прослушиваемый порт можно указать с помощью аргумента командной строки, что
        //      позволяет запустить несколько экземпляров, прослушивающих разные порты
        port,
        () => {
            console.log(`--- ${pid} --- http://localhost:${port}`);
        }
    );