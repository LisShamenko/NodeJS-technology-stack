"use strict";

// приемник является надежным узлом архитектуры, поэтому выполняется привязка 
//    сокета PULL, а не попытка подключить его к сокетам PUSH рабочих процессов
const zmq = require("zeromq/v5-compat");

// 
async function createSink(toPort, callback) {
    return new Promise(async (resolve, reject) => {

        // 
        const sink = zmq.socket('pull');
        sink.bindSync(`tcp://*:${toPort}`);
        sink.on('message', buffer => {
            console.log(`--- message: ${buffer.toString()}`);
            if (callback) {
                callback();
            }
        });

        // 
        resolve();
    });
}

// 
module.exports.createSink = createSink;