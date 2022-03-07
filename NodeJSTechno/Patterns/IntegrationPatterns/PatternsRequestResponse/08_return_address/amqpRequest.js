"use strict";

console.log(`--- amqpRequest`);

// 
const { v4 } = require('uuid');
const amqp = require('amqplib');

// создание нового запроса:
class AMQPRequest {

    // 
    constructor() {
        console.log(`--- AMQPRequest: initialize`);

        // 
        this.idToCallbackMap = {};
    }

    // 
    initialize() {
        console.log(`--- AMQPRequest: initialize`);

        //
        return amqp
            .connect('amqp://localhost')
            .then(conn => {
                console.log(`--- AMQPRequest: connect to channel`);

                // 
                return conn.createChannel();
            })
            .then(channel => {
                console.log(`--- AMQPRequest: channel`);

                // - создает очередь для хранения ответов 
                // - имя очереди будет выбрано случайным образом, 
                // - очередь является эксклюзивной, будет привязана к активному соединению 
                //      AMQP и будет уничтожена при его закрытии, нет необходимости привязывать
                //      очередь к коммутатору, так как мы не нуждаемся в маршрутизации и 
                //      распределении сообщений по нескольким очередям, сообщения должны 
                //      доставляться непосредственно в очередь ответов
                this.channel = channel;
                return channel.assertQueue('', { exclusive: true });
            })
            .then(queue => {
                console.log(`--- AMQPRequest: queue`);

                // 
                this.replyQueue = queue.queue;
                return this._listenForResponses();
            })
            .catch(err => {
                console.log(`--- AMQPRequest: err = ${err}`);
            });
    }

    // прототип amqpRequest, принимающий ответы:
    _listenForResponses() {

        // реализация приема сообщений из очереди, созданной специально для ответов
        return this.channel.consume(
            this.replyQueue,
            msg => {
                console.log(`--- AMQPRequest: consume`);

                // из принятого сообщения извлекается идентификатор для сопоставления 
                //      с идентификаторами, хранящимися в списке обработчиков, ожидающих 
                //      ответа и вызов найденного обработчика
                const correlationId = msg.properties.correlationId;
                const handler = this.idToCallbackMap[correlationId];
                if (handler) {
                    handler(JSON.parse(msg.content.toString()));
                }
            },
            {
                noAck: true
            }
        );
    }

    // принимает имя очереди запросов и сообщение для отправки
    request(queue, message, callback) {
        console.log(`--- AMQPRequest: request --- queue = ${queue}, message = ${message}`);

        // генерация идентификатора корреляции и связывание его с функцией обратного вызова
        const id = v4();
        this.idToCallbackMap[id] = callback;

        // выполняется отправка сообщения с установленными свойствами correlationId и replyTo
        this.channel.sendToQueue(queue,
            Buffer.from(JSON.stringify(message)),
            // в AMQP можно определить набор свойств, передаваемый потребителю наряду 
            //      с основным сообщением
            {
                correlationId: id,
                replyTo: this.replyQueue
            }
        );
    }
}

// 
module.exports = () => new AMQPRequest();