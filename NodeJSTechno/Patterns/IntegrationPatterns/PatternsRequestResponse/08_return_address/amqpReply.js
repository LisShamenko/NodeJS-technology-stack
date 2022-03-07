"use strict";

console.log(`--- AMQPReply`);

// 
const amqp = require('amqplib');

// 
class AMQPReply {

    //
    constructor(qName) {
        console.log(`--- AMQPReply: constructor`);

        // 
        this.qName = qName;
    }

    // создание простой надежной очереди для входящих запросов
    initialize() {
        console.log(`--- AMQPReply: initialize`);

        // 
        return amqp
            .connect('amqp://localhost')
            .then(conn => {
                console.log(`--- connect to channel`);
                return conn.createChannel();
            })
            .then(channel => {
                this.channel = channel;
                return this.channel.assertQueue(this.qName);
            })
            .then(queue => {
                this.queue = queue.queue;
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });
    }

    //
    handleRequest(handler) {
        console.log(`--- AMQPReply: handleRequest`);

        // 
        return this.channel.consume(this.queue, msg => {
            console.log(`--- AMQPReply: consume`);

            // 
            const content = JSON.parse(msg.content.toString());

            console.log(`--- AMQPReply: content = ${content}`);

            // 
            handler(content, reply => {

                console.log(`--- AMQPReply: handle reply = ${reply}`);

                // публикует сообщение в очереди, которая указана в свойстве 
                //      replyTo сообщения (обратный адрес)
                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(reply)),
                    // позволит получателю сопоставить сообщение со списком ожидающих запросов
                    {
                        correlationId: msg.properties.correlationId
                    }
                );

                // 
                this.channel.ack(msg);
            });
        });
    }
}

// 
module.exports = (excName, qName, pattern) => {
    console.log(`--- AMQPReply: new AMQPReply(${excName}, ${qName}, ${pattern})`);

    // 
    return new AMQPReply(excName, qName, pattern);
};