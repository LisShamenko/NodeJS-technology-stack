"use strict";

// 
const http = require('http');
const url = require('url');

// идентификатор процесса (PID)
const pid = process.pid;
console.log(`--- pid = ${pid}`);

// прослушиваемый порт можно указать с помощью аргумента командной строки, что
//      позволяет запустить несколько экземпляров, прослушивающих разные порты
const port = process.env.PORT || process.argv[2] || 3000;

// 
http
    .createServer(
        (req, res) => {
            const purl = url.parse(req.url, true);
            res.end(`--- ${pid} / ${purl.query.i} ---`);
        }
    )
    .listen(port, () => {
        console.log(`--- http://localhost:${port}`);
    });