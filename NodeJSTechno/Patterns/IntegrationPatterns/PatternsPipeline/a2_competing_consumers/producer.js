"use strict";

// 
const amqp = require('amqplib');
const variationsStream = require('variations-stream');

// 
async function createProducer(length, hash) {
    return new Promise(async (resolve, reject) => {

        // 
        const alphabet = 'ihb';
        const batchSize = 10;
        const maxLength = process.argv[2] || length;
        const searchHash = process.argv[3] || hash;

        // 
        let connection, channel;
        amqp
            .connect('amqp://localhost')
            .then(conn => {
                connection = conn;
                return conn.createChannel();
            })
            .then(ch => {
                channel = ch;
                produce();
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });

        // отсутствие коммутатора значительно упрощает настройку связей AMQP
        //      в реализации производителя не нужны даже очереди, так как 
        //      требуется только опубликовать сообщения

        // 
        function produce() {
            let batch = [];
            variationsStream(alphabet, maxLength)
                .on('data', combination => {
                    console.log(`--- combination: ${combination}`);

                    // 
                    batch.push(combination);
                    if (batch.length === batchSize) {
                        console.log(`--- searchHash: ${searchHash} --- batch: ${batch}`);
                        const msg = { searchHash: searchHash, variations: batch };

                        // этот метод отвечает за добавление сообщения в очередь jobs_queue, 
                        //      в обход коммутаторов и механизма маршрутизации
                        channel.sendToQueue(
                            'jobs_queue',
                            Buffer.from(JSON.stringify(msg)),
                            {
                                noAck: false
                            },
                            // закрытие соединения
                            (err, ok) => {
                                if (err !== null) {
                                    console.log(`--- err = ${err}`);
                                }
                                console.log(`--- ack`);
                            }
                        );
                        batch = [];
                    }
                })
                .on('end', () => {
                    const msg = { searchHash: searchHash, variations: batch };

                    // отправка последних комбинаций
                    channel.sendToQueue(
                        'jobs_queue',
                        Buffer.from(JSON.stringify(msg)),
                        {
                            noAck: false
                        },
                        // закрытие соединения
                        (err, ok) => {
                            if (err !== null) {
                                console.log(`--- err = ${err}`);
                            }
                            channel.close();
                            connection.close();
                        }
                    );
                });
        }

        //
        resolve();
    });
}

// 
module.exports.createProducer = createProducer;