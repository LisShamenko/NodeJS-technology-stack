"use strict";

// extensible multi-core server
const cluster = require('cluster');

// Использование модуля cluster основывается на рекуррентном шаблоне,
//      который упрощает запуск экземпляров:
//
//      if (cluster.isMaster) {
//          // fork()
//      } 
//      else {
//          // выполнение работы
//      }

// этот модуль отвечает за запуск главного процесса
if (cluster.isMaster) {
    console.log(`--- cluster.isMaster = ${cluster.isMaster}`);

    //      cluster.isMaster равна true
    //      cluster.isWorker равна false

    // определяется количество процессоров в системе и запускается равное количество 
    //      рабочих процессов, что позволяет задействовать все доступные мощности
    const os = require('os');
    const cpus = os.cpus().length;
    console.log(`--- count CPU: ${cpus}`);

    // вызов метода cluster.fork приводит к созданию дочернего потока
    for (let i = 0; i < 2; i++) {
        cluster.fork();
        console.log(`--- fork()`);
    }

    // 
    const { parallelRequests } = require('./../../testRequests');
    const onMessage = (id, obj) => {
        console.log(`MASTER: ${obj.message}`);
        setTimeout(
            () => {
                if (obj.isOk) {
                    parallelRequests(() => {
                        cluster.workers[id].process.kill();
                    });
                }
                else {
                    cluster.workers[id].send(`--- from master ---`);
                }
            },
            300
        );
    };

    // экземпляры доступны через переменную cluster.workers, что позволяет отправить 
    //      сообщение всем экземплярам сразу
    console.log(`--- cluster.workers = ${cluster.workers}`);
    for (const id in cluster.workers) { // Object.keys(cluster.workers).forEach(id => { }); // 
        console.log(`--- set events handlers --- ${id} ---`);
        cluster.workers[id].on('message', (obj) => onMessage(id, obj));
        cluster.workers[id].send(`--- from master ---`);
    }
}
else {
    console.log(`--- cluster.isWorker: ${cluster.isWorker}`);

    //      cluster.isMaster равен false
    //      cluster.isWorker равна true

    // Вызов cluster.fork в главном процессе запускает этот же модуль в виде рабочего
    //      процесса и на этот раз выполняется другая ветка оператора if, что приводит
    //      к запуску другого модуля.
    const { createServer } = require('./app');
    let isOk = false;

    // 
    console.log(`--- before async`);
    (async () => {
        await createServer(3000);
        console.log(`--- create server complete`);
        isOk = true;
    })();
    console.log(`--- after async`);

    // 
    process.on('message', async (msg) => {
        console.log(`CHILD: ${msg}`);
        process.send({ message: `--- from child ---`, isOk: isOk });
    });
}