"use strict";

// 
const http = require('http');
const url = require('url');

// идентификатор процесса (PID)
const pid = process.pid;
console.log(`--- pid = ${pid}`);

//
async function createServer(port = 3000) {
    return new Promise(async (resolve, reject) => {

        // 
        const server = http.createServer(
            (req, res) => {
                const purl = url.parse(req.url, true);
                console.log(`--- working body: ${purl.query.i}`);

                // цикл с 10 миллионами итераций
                for (let i = 1e7; i > 0; i--) { }

                // на любой запрос сервер возвращает PID своего процесса, что позволит 
                //      определить экземпляр приложения, обработавший запрос
                res.end(`--- ${pid} / ${purl.query.i} ---`);
            }
        ).listen(port, () => resolve(server));
    });
}

// 
module.exports.createServer = createServer;