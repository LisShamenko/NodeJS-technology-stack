const amqpPromise = require('amqplib');
const amqpCallback = require('amqplib/callback_api');



// --------------- 1. Hello World.

//      https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html

// RabbitMQ - это брокер (Broker) сообщений, который принимает и пересылает сообщения
//      в виде бинарных блоков данных.

// Producing - это отправка сообщений. Producer - это производитель; программа, 
//      которая отправляет сообщения.
//      ╭───╮
//      │ P │
//      ╰───╯

// Consuming - это получение сообщений. Consumer - это потребитель; программа, 
//      которая ожидает получения сообщений.
//      ╭───╮
//      │ C │
//      ╰───╯

// Queue - это большой буфер сообщений. Очередь ограничена только размерами диска и 
//      оперативной памяти. Сообщения проходят через Broker, от Producer в Consumer и 
//      могут храниться только внутри очереди. Многие Producers могут отправлять 
//      сообщения в одну очередь и многие Consumers могут получать данные из одной 
//      очереди.
//      ┌──┬───┬───┬───┬───┬───┐
//      │QN│░░░│░░░│░░░│   │   │
//      └──┴───┴───┴───┴───┴───┘

// Producer, Consumer и Broker не обязательно должны находиться на одном хосте. 
//      Приложение может быть как Producer, так и Consumer.

// --- 1.1 Diagram.

// Producer отправляет одно сообщение. Consumer получает и распечатывает сообщения.

//      ╭───╮   ┌───┬───┬───┬───┬───┐   ╭───╮
//      │ P ├ → ┤░░░│░░░│░░░│   │   ├ → ┤ C │
//      ╰───╯   └───┴───┴───┴───┴───┘   ╰───╯

// --- 1.2 Producer (publisher.js)

// Очередь создается при помощи метода assertQueue. Очередь будет создана, если 
//      она еще не существует. Сообщение представляет собой массив байт, поэтому 
//      в сообщение может быть закодированно все, что угодно.

// RabbitMQ не позволяет пересоздавать существующую очередь с другими параметрами 
//      и возвращает ошибку. 

function helloWorld_producer_callback() {
    console.log(`
        --- --- --- Hello World: Producer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // создается канал 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            let queue = 'hello';
            let msg = 'Hello World!';

            // объявление очереди для отправки
            channel.assertQueue(queue, {
                durable: false
            });

            // опубликовать сообщение в очередь
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log("--- [x] Sent %s", msg);
        });

        // закрыть соединение и выйти после 500ms
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

async function helloWorld_producer_promise(resultCallback) {
    console.log(`
        --- --- --- Hello World: Producer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let queue = 'hello';
        let msg = 'Hello World!';

        // объявление очереди для отправки
        const assertQueue = await channel.assertQueue(queue, { durable: false });
        console.log(`--- Producer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // опубликовать сообщение в очередь
        const isSend = channel.sendToQueue(queue, Buffer.from(msg), {}, (err, ok) => {

            console.log(`--- Producer --- err: ${err}`);
            console.log(`--- Producer --- OK: ${ok}`);

            // закрыть соединение
            connection.close();
            setTimeout(() => resultCallback(), 500);
        });
        console.log(`--- Producer.sendToQueue --- message "${msg}" is send: ${isSend}`);

        // 
        resolve();
    });
}

// --- 1.3 Consumer (receiver.js)

// Поскольку Consumer может быть запущен раньше, чем Producer, то следует убедится,
//      что очередь существует. Для этого метод assertQueue вызывается на стороне
//      получателя сообщений.

function helloWorld_consumer_callback() {
    console.log(`
        --- --- --- Hello World: Consumer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // создается канал 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            var queue = 'hello';

            // объявляется очередь
            channel.assertQueue(queue, {
                durable: false
            });

            // метод consume асинхронно ожидает сообщений от Producer
            channel.consume(queue,
                (msg) => {
                    console.log(" [x] Received %s", msg.content.toString());
                },
                {
                    noAck: true
                }
            );
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        });
    });
}

async function helloWorld_consumer_promise(resultCallback) {
    console.log(`
        --- --- --- Hello World: Consumer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        var queue = 'hello';

        // объявление очереди для отправки
        const assertQueue = await channel.assertQueue(queue, { durable: false });
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // метод consume асинхронно ожидает сообщений от Producer
        const consume = await channel.consume(queue,
            (msg) => {
                console.log(`--- Consumer --- message from Producer: ${msg.content.toString()}`);

                // закрыть соединение
                connection.close();
                setTimeout(() => resultCallback(), 500);
            },
            { noAck: true }
        );
        console.log(`--- Consumer.consume 
            --- consume.consumerTag = ${consume.consumerTag}
            --- Waiting for messages in ${queue}. To exit press CTRL+C.
        `);

        // 
        resolve();
    });
}

// --- Запуск.

// Потребитель отобразит сообщение, полученное от издателя через RabbitMQ. 
//      ./send.js
//      ./receive.js

// Список очередей с сообщениями можно посмотреть с помощью утилиты rabbitmqctl:
//      sudo rabbitmqctl list_queues

(async () => {

    let i = 0;
    const check = () => {
        i++;
        if (i >= 2) process.exit(0);
    };

    await helloWorld_producer_promise(() => '');
    await helloWorld_consumer_promise(() => process.exit(0));
})();