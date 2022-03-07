"use strict";

// --- взаимодействие с родительским процессом

console.log(`--- root process: ${process.argv[0]}`);
console.log(`--- sub worker: ${process.argv[1]}`);
console.log(`--- subset app: ${process.argv[2]}`);
const SubsetSum = require(process.argv[2]);

// - сразу после запуска в классе subsetSumWorker, дочерний процесс начинает 
//      принимать сообщения, поступающие от родительского процесса
// - это часть возможностей коммуникационного канала, предоставляемого всем процессам, 
//      запущенным с помощью функции child_process.fork
// - от родительского процесса поступает сообщение, содержащее исходные данные,
//      в обработчике события по этим данным создается новое задание SubsetSum,  
//      для которого регистрируются обработчики событий match и end, после чего
//      алгоритм запускается методом subsetSum.start
process.on('message', msg => {

    // 
    const subsetSum = new SubsetSum(msg.sum, msg.set);

    // при получении любого события от выполняющегося алгоритма оно обертывается
    //      в объект формата {event, data} и отправляется родительскому процессу
    subsetSum.on('match', data => {
        process.send({ event: 'match', data: data });
    });

    // 
    subsetSum.on('end', data => {
        process.send({ event: 'end', data: data });
    });

    // 
    subsetSum.start();
});