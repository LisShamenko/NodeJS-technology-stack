const amqpPromise = require('amqplib');
const amqpCallback = require('amqplib/callback_api');
const { appendFile } = require('fs');



// --------------- 3. Publish/Subscribe.

//      https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html

// Шаблон "publish/subscribe" заключается в доставке каждого сообщения нескольким
//      получателям. 

// --- 3.1 Diagram.

//                          ┌──┬───┬───┬───┬───┬───┐   ╭────╮
//                      ╭ → ┤Q1│░░░│░░░│░░░│   │   ├ → ┤ C1 │
//      ╭───╮   ╭───╮   │   └──┴───┴───┴───┴───┴───┘   ╰────╯
//      │ P ├ → ┤ X ├ → ┤       
//      ╰───╯   ╰───╯   │   ┌──┬───┬───┬───┬───┬───┐   ╭────╮
//                      ╰ → ┤Q2│░░░│░░░│░░░│   │   ├ → ┤ C2 │
//                          └──┴───┴───┴───┴───┴───┘   ╰────╯

// Система ведения журнала будет состоять из следующих частей: 
//      - Producer создает сообщения журнала и помещает их в очередь;
//      - первый Consumer отображает сообщения в консоле;
//      - второй Consumer записывает сообщения на диск;

// Опубликованные сообщения журнала будут транслироваться всем получателям.

// --- 3.2 Exchanges.

// Основная идея модели обмена сообщениями в RabbitMQ заключается в том, что 
//      Producer не отправляет сообщения непосредственно в очередь. Producer 
//      может даже не знать, будет ли вообще сообщение доставлено в какую-либо 
//      очередь. Вместо этого сообщения помещаются в распределитель (Exchange),
//      который отправляет их в очереди. Между распределителем и очередью 
//      должна быть создана привязка, чтобы распределитель мог отправить 
//      сообщения в эту очередь. Таким образом модель будет включать: Producer, 
//      Exchange, Queue и Consumer.

// Producer - это производитель; отправляет сообщения в Exchange.

// Exchange - это распределитель сообщений, который получает сообщения от Producer
//      и помещает их в очередь. То как это будет происходить определяется типом
//      распределителя: direct, topic, headers, fanout. Распределитель типа fanout 
//      рассылает все полученные сообщения во все известные ему очереди.

// Queue - это буфер сообщений.

// Consumer - это потребитель, который получает сообщения из очереди.

// Создать распределитель с именем logs и типом fanout:
//      channel.assertExchange('logs', 'fanout', { durable: false })

// Чтобы отправлять сообщения в распределитель следует вторым аргументом указать 
//      пустую строку:
//      channel.publish('logs', '', Buffer.from('Hello World!'));

// --- --- Список Exchange.

// Чтобы получить список Exchange на сервере следует использовать команду:
//      sudo rabbitmqctl list_exchanges

// Список будет содержать Exchange с именами 'amq.*' и Exchange по умолчанию,
//      который не имеет имени.

// --- --- Exchange по умолчанию.

// Следующий вызов использует Exchange по умолчанию, который отправляет сообщения 
//      в очередь из первого аргумента:
//      channel.sendToQueue('hello', Buffer.from('Hello World!'));

// --- 3.3 Temporary queues.

//      https://www.rabbitmq.com/queues.html

// Очередь должна иметь имя, если требуется разделить её между производителями и 
//      потребителями. 

// Если требуется получать все сообщения от распределителя и это должны быть только
//      новые сообщения, то потребуется выполнить два условия:
//      1. При подключении к Rabbit требуется новая пустая очередь. Можно создать 
//          очередь со случайным именем или позволить серверу выбрать имя очереди.
//      2. При отключении потребителя, очередь должна быть автоматически удалена.

// Если указать имя очереди в виде пустой строки, то созданая очередь будет иметь
//      случайно сгенерированное имя, например, 'amq.gen-JzTY20BRgKO-HjmUJj0wLg'. 
//      Параметр 'exclusive:true' указывает, что очередь будет удалена, когда 
//      закроется соединение, которое её создала.

// channel.assertQueue('', {
//     exclusive: true
// });

// --- 3.4 Bindings.

// Чтобы указать Exchange отправлять сообщения в очередь следует создать привязку
//      между очередью и распределителем:
//      channel.bindQueue(queue_name, 'logs', '');

// --- --- Listing bindings

// Существующие привязки можно перечислить следующей командой:
//      rabbitmqctl list_bindings

// --- 3.5 Producer (emit_log.js)

function publishSubscribe_producer_callback() {
    console.log(`
        --- --- --- Publish Subscribe: Producer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel((err, channel) => {
            if (err) throw err;

            // 
            var exchange = 'logs';
            var msg = process.argv.slice(2).join(' ') || 'Hello World!';

            // создать распределитель с именем logs: 
            // - тип fanout указывает, что сообщения будут рассылаться во все очереди 
            // - 'durable:false' указывает, что очередь будет удалена после отключения
            channel.assertExchange(exchange, 'fanout', { durable: false });

            // указать, что сообщение будет отправлено в распределитель
            channel.publish(exchange, '', Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

async function publishSubscribe_producer_promise(msg, resultCallback) {
    console.log(`
        --- --- --- Publish Subscribe: Producer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let exchange = 'logs';

        // создать распределитель с именем logs: 
        // - тип fanout указывает, что сообщения будут рассылаться во все очереди 
        // - 'durable:false' указывает, что очередь будет удалена после отключения
        const assertExchange = channel.assertExchange(exchange, 'fanout', { durable: false });
        console.log(`--- Producer.assertExchange --- assertExchange = ${JSON.stringify(assertExchange)}`);

        // указать, что сообщение будет отправлено в распределитель
        const isSend = channel.publish(exchange, '', Buffer.from(msg), {},
            (err, ok) => {

                console.log(`--- Producer --- err: ${err}`);
                console.log(`--- Producer --- OK: ${ok}`);

                // закрыть соединение
                connection.close();
                setTimeout(() => resultCallback(), 500);
            }
        );
        console.log(`--- Producer.sendToQueue --- message "${msg}" is send: ${isSend}`);

        // 
        resolve();
    });
}

// --- 3.6 Consumer (receive_logs.js)

function publishSubscribe_producer_callback() {
    console.log(`
        --- --- --- Publish Subscribe: Consumer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var exchange = 'logs';

            // подключиться к распределителю с именем logs
            channel.assertExchange(exchange, 'fanout', { durable: false });

            // значение '' означает, что созданая очередь будет иметь случайно 
            //      сгенерированное имя
            channel.assertQueue('',
                // exclusive указывает, что очередь будет удалена, когда 
                //      соединение закроется
                { exclusive: true },
                // 
                (err, q) => {
                    if (err) throw err;

                    // создать привязку между очередью и распределителем, где 
                    //      q - это созданная очередь
                    //      exchange - распределитель
                    channel.bindQueue(q.queue, exchange, '');

                    // обработка получаемых сообщений
                    channel.consume(q.queue,
                        (msg) => {
                            if (msg.content) {
                                console.log(" [x] %s", msg.content.toString());
                            }
                        },
                        { noAck: true }
                    );
                    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
                }
            );
        });
    });
}

async function publishSubscribe_consumer_promise(resultCallback) {
    console.log(`
        --- --- --- Publish Subscribe: Consumer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        var exchange = 'logs';

        // подключиться к распределителю с именем logs
        const assertExchange = await channel.assertExchange(exchange, 'fanout', { durable: false });
        console.log(`--- Producer.assertExchange --- assertExchange = ${JSON.stringify(assertExchange)}`);

        // значение '' означает, что созданая очередь будет иметь случайно 
        //      сгенерированное имя
        const assertQueue = await channel.assertQueue('',
            // exclusive указывает, что очередь будет удалена, когда 
            //      соединение закроется
            { exclusive: true }
        );
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // создать привязку между очередью и распределителем, где 
        //      q - это созданная очередь
        //      exchange - распределитель
        channel.bindQueue(assertQueue.queue, exchange, '');

        // обработка получаемых сообщений
        const consume = await channel.consume(assertQueue.queue,
            (msg) => {
                resultCallback(msg);
            },
            { noAck: true }
        );
        console.log(`--- Consumer.consume 
            --- consume.consumerTag = ${consume.consumerTag}
            --- Waiting for messages in ${assertQueue.queue}. To exit press CTRL+C.
        `);

        // 
        resolve();
    });
}

// --- Запуск.

// Запуск Consumer, который записывает сообщения в файл:
//      ./receive_logs.js > logs_from_rabbit.log

// Запуск Consumer, который отображает сообщения в консоле:
//      ./receive_logs.js

// Запуск Producer:
//      ./emit_log.js

// Чтобы увидеть привязки следует вызвать команду list_bindings, которая покажет, 
//      что данные из Exchange попадают в две очереди с именами, сгенерированными 
//      сервером:
//      sudo rabbitmqctl list_bindings
//      # => Listing bindings ...
//      # => logs    exchange        amq.gen-JzTY20BRgKO-HjmUJj0wLg  queue           []
//      # => logs    exchange        amq.gen-vso0PVvyiRIL2WoV3i48Yg  queue           []
//      # => ...done.

(async () => {

    let c = 0;
    const check = () => {
        if (++c >= 2) process.exit(0);
    };

    await publishSubscribe_consumer_promise((msg) => {
        if (msg.content) {
            console.log(`--- content = ${msg.content.toString()}`);
        }
        console.log(`--- Consumer 1 --- complete`);
        check();
    });

    await publishSubscribe_consumer_promise(async (msg) => {
        if (msg.content) {
            appendFile('message.txt', new Uint8Array(msg.content), () => {
                console.log(`--- Consumer 2 --- complete`);
                check();
            });
        }
        else {
            console.log(`--- Consumer 2 --- message undefined`);
            check();
        }
    });

    await publishSubscribe_producer_promise(`\nlog-message: ${Math.random()}`, () => console.log(``));
})();