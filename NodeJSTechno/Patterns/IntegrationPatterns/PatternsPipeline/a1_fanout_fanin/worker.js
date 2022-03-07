"use strict";

// реализация параллельного конвейера с узлом для создания и распределения заданий 
//      между несколькими рабочими процессами и узел, собирающий полученные результаты

const zmq = require("zeromq/v5-compat");
const crypto = require('crypto');

// 
async function createWorker(fromPort, toPort) {
    return new Promise(async (resolve, reject) => {

        //
        const fromVentilator = zmq.socket('pull');
        const toSink = zmq.socket('push');

        // рабочий процесс представляет промежуточный узел в архитектуре, поэтому его сокеты 
        //      должны подключаться к удаленному узлу, а не принимать входящие подключения:
        //      - сокет PULL подключается к генератору для получения заданий;
        //      - сокет PUSH подключается к приемнику для передачи результатов.

        console.log(`--- 1 --- create PULL --- tcp://localhost:${fromPort}`);
        fromVentilator.connect(`tcp://localhost:${fromPort}`);

        console.log(`--- 1 --- create PUSH --- tcp://localhost:${toPort}`);
        toSink.connect(`tcp://localhost:${toPort}`);

        //
        fromVentilator.on('message', buffer => {
            const msg = JSON.parse(buffer);

            // для каждого сообщения перебрать содержащийся в нем пакет слов
            const variations = msg.variations;
            variations.forEach(word => {

                // для каждого слова вычислить контрольную сумму по алгоритму SHA1 и 
                //      сравнить ее с переданным в сообщении значением searchHash
                const shasum = crypto.createHash('sha1');
                shasum.update(word);
                const digest = shasum.digest('hex');

                // 
                console.log(`--- processing: ${word} --- digest: ${digest} --- search: ${msg.searchHash}`);
                if (digest === msg.searchHash) {
                    console.log(`--- found: ${word}`);

                    // передать результат приемнику
                    toSink.send(`--- found: ${digest} => ${word}`);
                }
            });
        });

        // 
        resolve();
    });
}

// 
module.exports.createWorker = createWorker;