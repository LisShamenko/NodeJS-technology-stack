const amqpPromise = require('amqplib');
const amqpCallback = require('amqplib/callback_api');
const { appendFile } = require('fs');



// --------------- 4. Routing.

//      https://www.rabbitmq.com/tutorials/tutorial-four-javascript.html

// --- 4.1 Diagram.

//                      error      ┌──┬───┬───┬───┬───┬───┐   ╭────╮
// (type = direct)╮ ╭─────────── → ┤Q1│░░░│░░░│░░░│   │   ├ → ┤ C1 │
//      ╭───╮   ╭─┴─┴─╮ info       └──┴───┴───┴───┴───┴───┘   ╰────╯
//      │ P ├ → ┤  X  ├───────── → ─╮ 
//      ╰───╯   ╰─┬─┬─╯ error      ┌┴─┬───┬───┬───┬───┬───┐   ╭────╮
//                │ ╰─────────── → ┤Q2│░░░│░░░│░░░│   │   ├ → ┤ C2 │
//                │     warning    └┬─┴───┴───┴───┴───┴───┘   ╰────╯
//                ╰───────────── → ─╯

// Подписка на подмножество сообщений даёт возможность записывать в файл логов только 
//      критические сообщения об ошибках (error), но при этом отображать все сообщения 
//      (info, error, warning) в консоль.

// --- 4.2 Bindings.

// Binding - это отношение между Exchange и очередью, которое читается как: очередь 
//      заинтересована в сообщениях от распределителя. При создании привязки в качестве
//      третьего аргумента может быть передано значение key, применение которого 
//      зависит от типа распределителя. Тип fanout игнорирует это значение.

//      channel.bindQueue(queue_name, exchange_name, 'black');

// --- 4.3 Direct exchange.

// Распределитель типа fanout рассылает сообщения по потребителям равномерно.

// Распределитель типа direct отправляет сообщения в те очереди, значение 
//      'binding key' которых соответствует значению 'routing key' сообщений.

//                      orange     ┌──┬───┬───┬───┬───┬───┐   ╭────╮
// (type = direct)╮ ╭─────────── → ┤Q1│░░░│░░░│░░░│   │   ├ → ┤ C1 │
//      ╭───╮   ╭─┴─┴─╮ black      └──┴───┴───┴───┴───┴───┘   ╰────╯
//      │ P ├ → ┤  X  ├───────── → ─╮ 
//      ╰───╯   ╰───┬─╯ green      ┌┴─┬───┬───┬───┬───┬───┐   ╭────╮
//                  ╰─────────── → ┤Q2│░░░│░░░│░░░│   │   ├ → ┤ C2 │
//                                 └──┴───┴───┴───┴───┴───┘   ╰────╯

// Exchange типа direct распределяет сообщения по двум очередям, где очередь Q1 
//      имеет привязку к ключу orange, а Q2 имеет две привязки к двум ключам: 
//      black и green. Таким образом, сообщения с ключом orange будут направлены
//      в очередь Q1, а сообщения с ключами black и green в очередь Q2.

// --- 4.4 Multiple bindings.

//                    black ┌──┬───┬───┬───┬───┬───┐   ╭────╮
// (type = direct)╮     ╭ → ┤Q1│░░░│░░░│░░░│   │   ├ → ┤ C1 │
//      ╭───╮   ╭─┴─╮   │   └──┴───┴───┴───┴───┴───┘   ╰────╯
//      │ P ├ → ┤ X ├ → ┤       
//      ╰───╯   ╰───╯   │   ┌──┬───┬───┬───┬───┬───┐   ╭────╮
//                      ╰ → ┤Q2│░░░│░░░│░░░│   │   ├ → ┤ C2 │
//                    black └──┴───┴───┴───┴───┴───┘   ╰────╯

// Несколько очередей могут быть привязаны к распределителю при помощи одного ключа.
//      Например, если связать Exchange с очередями Q1 и Q2 через ключ black, то это
//      будет соответствовать типу fanout, который работает только с сообщениями
//      помеченными ключом black. 

// --- 4.5 Producer (emit_log_direct.js)

function routing_producer_callback() {
    console.log(`
        --- --- --- Routing: Producer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var exchange = 'direct_logs';
            var args = process.argv.slice(2);
            var msg = args.slice(1).join(' ') || 'Hello World!';
            var severity = (args.length > 0) ? args[0] : 'info';

            // создает распределитель типа direct, который может отправлять 
            //      сообщения по ключу
            channel.assertExchange(exchange, 'direct', {
                durable: false
            });

            // публикует в распределитель 'direct_logs' сообщение с ключом
            //      указанным в severity
            channel.publish(exchange, severity, Buffer.from(msg));
            console.log(" [x] Sent %s: '%s'", severity, msg);
        });

        // 
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

async function routing_producer_promise(msg, severity, resultCallback) {
    console.log(`
        --- --- --- Routing: Producer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let exchange = 'direct_logs';

        // создает распределитель типа direct, который может отправлять 
        //      сообщения по ключу
        const assertExchange = await channel.assertExchange(exchange, 'direct', { durable: false });
        console.log(`--- Producer.assertExchange --- assertExchange = ${JSON.stringify(assertExchange)}`);

        // публикует в распределитель 'direct_logs' сообщение с ключом
        //      указанным в severity
        const isSend = channel.publish(exchange, severity, Buffer.from(msg), {},
            (err, ok) => {

                console.log(`--- Producer --- err: ${err}`);
                console.log(`--- Producer --- OK: ${ok}`);

                // закрыть соединение
                connection.close();
                setTimeout(() => resultCallback(), 500);
            }
        );
        console.log(`--- Producer.sendToQueue 
            --- severity = ${severity}
            --- message "${msg}" is send: ${isSend}
        `);

        // 
        resolve();
    });
}

// --- 4.6 Consumer (receive_logs_direct.js)

function routing_consumer_callback() {
    console.log(`
        --- --- --- Routing: Consumer. --- --- ---
    `);

    // 
    var args = process.argv.slice(2);
    if (args.length == 0) {
        console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
        process.exit(1);
    }

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            //
            var exchange = 'direct_logs';

            // 
            channel.assertExchange(exchange, 'direct', {
                durable: false
            });

            //
            channel.assertQueue('',
                { exclusive: true },
                function (err, q) {
                    if (err) throw err;

                    // потребитель должен создать привязки для всех ключей, сообщения 
                    //      которых он хочет получать
                    args.forEach((severity) => {
                        channel.bindQueue(q.queue, exchange, severity);
                    });

                    // обработка получаемых сообщений
                    channel.consume(q.queue,
                        function (msg) {
                            console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
                        },
                        { noAck: true }
                    );
                    console.log(' [*] Waiting for logs. To exit press CTRL+C');
                }
            );
        });
    });
}

async function routing_consumer_promise(levels, resultCallback) {
    console.log(`
        --- --- --- Routing: Consumer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        //
        var exchange = 'direct_logs';

        // 
        const assertExchange = channel.assertExchange(exchange, 'direct', { durable: false });

        //
        const assertQueue = await channel.assertQueue('', { exclusive: true });
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // потребитель должен создать привязки для всех ключей, сообщения 
        //      которых он хочет получать
        levels.forEach((severity) => {
            channel.bindQueue(assertQueue.queue, exchange, severity);
        });

        // обработка получаемых сообщений
        const consume = await channel.consume(assertQueue.queue,
            (msg) => {
                setTimeout(() => resultCallback(msg), 500);
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

// --- Запуск

// Запуск Consumer, который будет записывать в файл только error сообщения:
//      ./receive_logs_direct.js error > logs_from_rabbit.log

// Запуск Consumer, который отображает все сообщения в консоле:
//      ./receive_logs_direct.js info warning error
//      # => [*] Waiting for logs. To exit press CTRL+C

// Запуск Producer:
//      ./emit_log_direct.js error 
//      # => [x] Sent 'error':'Run. Run. Or it will explode.'

(async () => {

    let c = 0;
    const check = () => {
        if (++c >= 3) process.exit(0);
    };

    await routing_consumer_promise(
        ["error"],
        async (msg) => {
            if (msg.content) {
                console.log(`
                    --- content = ${msg.content.toString()} 
                    --- routingKey: ${msg.fields.routingKey}
                `);
            }
            console.log(`--- Consumer 1 --- complete message: ${msg.content.toString()}`);
            check();
        }
    );

    await routing_consumer_promise(
        ["info", "error"],
        async (msg) => {
            if (msg.content) {
                appendFile('message.txt', new Uint8Array(msg.content), () => {
                    console.log(`--- Consumer 2 --- complete message: ${msg.content.toString()}`);
                    check();
                });
            }
            else {
                console.log(`--- Consumer 2 --- message undefined`);
                check();
            }
        }
    );

    await routing_producer_promise(`\nwarning message: ${Math.random()}`, "warning", () => { });
    await routing_producer_promise(`\nerror message: ${Math.random()}`, "error", () => { });
    await routing_producer_promise(`\ninfo message: ${Math.random()}`, "info", () => { });
})();