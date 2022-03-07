"use strict";

// 
const cluster = require('cluster');
const os = require('os');

// если один из рабочих процессов завершился с ошибкой, то достаточно 
//      реализовать запуск нового рабочего процесса

// 
if (cluster.isMaster) {

    // 
    const os = require('os');
    const cpus = os.cpus().length;
    console.log(`--- count CPU: ${cpus}`);

    // 
    for (let i = 0; i < 2; i++) {
        cluster.fork();
        console.log(`--- fork()`);
    }

    // получив событие 'exit', главный процесс проверит, как завершился процесс
    let isRefork = false;
    cluster.on('exit', (worker, code) => {
        // code - код состояния
        // worker.exitedAfterDisconnect - флаг указывает, что рабочий процесс был 
        //      завершен по инициативе главного процесса
        if (code != 0 && !worker.exitedAfterDisconnect) {

            // процесс завершился с ошибкой
            console.log(`--- worker error --- code = ${code} `);

            // повторный запуск рабочего процесса, в это же время другие рабочие 
            //      процессы продолжают обслуживать запросы, что обеспечивает 
            //      доступность приложения
            if (isRefork) {
                cluster.fork();
            }
        }
    });
}
else {

    // 
    const { createServer } = require('./../cluster/app');
    (async () => {
        await createServer(3000);
    })();

    // 
    const { throwError } = require('./../../testError');
    throwError('--- error after 500ms', 500);
}