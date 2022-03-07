"use strict";

//
const cluster = require('cluster');

// программа использует UNIX-сигналы и не будет работать в Windows,
//      (смотри про подсистему Linux в Windows 10)

//
if (cluster.isMaster) {

    // 
    const os = require('os');
    const cpus = os.cpus().length;
    console.log(`--- count CPU: ${cpus}`);

    // 
    for (let i = 0; i < 2; i++) {
        cluster.fork();
        console.log(`--- fork`);
    }

    //
    cluster.on('exit', (worker, code) => {
        if (code != 0 && !worker.exitedAfterDisconnect) {
            console.log(`--- restart fork`);
            cluster.fork();
        }
    });

    // Сигналы являются простейшим механизмом реализации, но не единственным:
    //      обработка команд, поступающих из сокета, канала или стандартного ввода.

    // перезапуск рабочих процессов после получения сигнала SIGUSR2
    process.on('SIGUSR2', () => {

        // 
        console.log('--- restart workers');
        const workers = Object.keys(cluster.workers);

        // реализует шаблон асинхронных последовательных итераций 
        //      по элементам объекта cluster.workers
        function restartWorker(i) {

            // 
            if (i >= workers.length) return;

            // 
            const worker = cluster.workers[workers[i]];
            console.log(`--- stop worker --- pid: ${worker.process.pid}`);

            // 
            worker.on('exit', () => {
                if (!worker.suicide) return;

                // после завершения процесса запускается новый рабочий процесс
                const newWorker = cluster.fork();

                // перейти к следующей иетрации (перезапуску следующего рабочего процесса)
                //      можно будет, когда новый рабочий процесс будет готов к приему новых 
                //      соединений
                newWorker.on('listening', () => restartWorker(i + 1));
            });

            // безопасная остановка рабочего процесса
            worker.disconnect();
        }

        // пере запуск процессов
        restartWorker(0);
    });

    // запуск события 'SIGUSR2' 
    setTimeout(() => process.emit('SIGUSR2'), 1000);
}
else {

    // 
    require('./../cluster/app');

    // вызов события 'exit' на cluster
    //      require('./../../testerror');
    //      throwError('hello', 500);
}












//
if (cluster.isMaster) {






}
else {
    require('./app');

}