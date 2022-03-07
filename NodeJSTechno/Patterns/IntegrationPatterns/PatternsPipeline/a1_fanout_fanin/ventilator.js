"use strict";

// variations-stream - создание вариантов с применением потокового интерфейса
//      https://npmjs.org/package/variations-stream

const zmq = require("zeromq/v5-compat");
const variationsStream = require('variations-stream');

// 
async function createVentilator(fromPort, length, hash) {
    return new Promise(async (resolve, reject) => {

        // 
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        // количество слов в пакете
        const batchSize = 100;
        // ограничивает размер генерируемых слов
        const maxLength = process.argv[2] || length;
        // искомая хеш-­сумма
        const searchHash = process.argv[3] || hash;

        // создается сокет PUSH и привязывается к локальному порту 5000, к которому 
        //      рабочие процессы подключат свои сокеты PULL для получения заданий
        const ventilator = zmq.socket('push');
        ventilator.bindSync(`tcp://*:${fromPort}`);

        // 
        let batch = [];
        variationsStream(alphabet, maxLength)
            .on('data', combination => {
                batch.push(combination);
                // формируется сообщение, содержащее хеш для сопоставления и пакет
                //      сгруппированный из 10 тысяч слов для проверки, сообщение
                //      явялется объектом задания, который получают рабочие процессы
                if (batch.length === batchSize) {
                    const msg = { searchHash: searchHash, variations: batch };
                    // сообщение передается следующему доступному рабочему процессу 
                    //      в соответствии с циклическим алгоритмом
                    ventilator.send(JSON.stringify(msg));
                    batch = [];
                }
            })
            .on('end', () => {
                // отправить оставшиеся комбинации
                const msg = { searchHash: searchHash, variations: batch };
                ventilator.send(JSON.stringify(msg));
            });

        // 
        resolve();
    });
}

// 
module.exports.createVentilator = createVentilator;