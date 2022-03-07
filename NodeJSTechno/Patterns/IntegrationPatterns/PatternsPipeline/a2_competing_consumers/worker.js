"use strict";

// 
const amqp = require('amqplib');
const crypto = require('crypto');

// Запуск:
//    "amqplib": "^0.4.1"
//    "variations-stream": "^0.1.3"
//    node worker
//    node worker
//    node collector
//    node producer 4 f8e966d1e207d02c44511a58dccff2f5429e9a3b

// 
async function createWorker() {
    return new Promise(async (resolve, reject) => {

        // 
        const queueName = 'jobs_queue';

        // 
        amqp
            .connect('amqp://localhost')
            .then(conn => {
                console.log(`--- connect to channel`);
                return conn.createChannel();
            })
            .then(channel => {
                // проверяется наличие очереди
                channel.assertQueue(queueName)
                return channel;
            })
            .then(channel => {
                // если она имеется, начинается прием входящих заданий 
                //      с помощью channel.consume
                consume(channel);
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });

        // 
        function consume(channel) {
            channel.consume(queueName, function (msg) {
                const data = JSON.parse(msg.content.toString());

                // 
                const variations = data.variations;
                variations.forEach(word => {
                    const shasum = crypto.createHash('sha1');
                    shasum.update(word);
                    const digest = shasum.digest('hex');

                    // 
                    console.log(`--- processing: ${word} --- digest: ${digest} --- search: ${data.searchHash}`);
                    if (digest === data.searchHash) {
                        console.log(`--- found: ${word}`);

                        // результат отправляется сборщику через очередь results_queue
                        //      с использованием связи точка­-точка
                        channel.sendToQueue('results_queue',
                            Buffer.from(`Found! ${digest} => ${word}`)
                        );
                    }
                });

                // 
                channel.ack(msg);
            });
        }

        //
        resolve();
    });
}

// 
module.exports.createWorker = createWorker;