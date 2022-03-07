"use strict";

//
const amqp = require('amqplib');

// 
async function createCollector() {
    return new Promise(async (resolve, reject) => {

        // 
        const queueName = 'results_queue';

        // 
        amqp
            .connect('amqp://localhost')
            .then(conn => {
                console.log(`--- connect to channel`);
                return conn.createChannel();
            })
            .then(channel => {
                channel.assertQueue(queueName);
                return channel;
            })
            .then(channel => {
                channel.consume(queueName, msg => {
                    console.log(`--- worker's message: ${msg.content.toString()}`);
                });
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });

        //
        resolve();
    });
}

// 
module.exports.createCollector = createCollector;