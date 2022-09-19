const amqpPromise = require('amqplib');
const amqp = require('amqplib/callback_api');



// --------------- 5. Topics.

//      https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html

// Распределитель типа direct не позволяет выполнять маршрутизацию на основе 
//      нескольких критериев. Например, syslog в Unix системах позволяет
//      настроить логирование на основе двух критериев: 
//      severity (info/warn/crit...) и facility (auth/cron/kern...).
//      Распределитель типа topic решает эту проблему позволяет.

// --- 5.1 Diagram.

//                      *.orange.*    ┌──┬───┬───┬───┬───┬───┐   ╭────╮
//  (type = topic)╮ ╭────────────── → ┤Q1│░░░│░░░│░░░│   │   ├ → ┤ C1 │
//      ╭───╮   ╭─┴─┴─╮ *.*.rabbit    └──┴───┴───┴───┴───┴───┘   ╰────╯
//      │ P ├ → ┤  X  ├──────────── → ─╮ 
//      ╰───╯   ╰───┬─╯ laz y.#       ┌┴─┬───┬───┬───┬───┬───┐   ╭────╮
//                  ╰────────────── → ┤Q2│░░░│░░░│░░░│   │   ├ → ┤ C2 │
//                                    └──┴───┴───┴───┴───┴───┘   ╰────╯

// --- 5.2 Topic exchange.

// Сообщения, отправляемые в распределитель типа topic, должны содержать в свойстве
//      routing_key список слов, разделенных точками. Слова могут быть любыми, но 
//      обычно они определяют некоторые особенности, связанные с сообщением. 
//      Например, 'stock.usd.nyse', 'nyse.vmw', 'quick.orange.rabbit'. Ключ может
//      содержать любое количество слов, но его размер не должен превышать 255 байт.

// Ключ привязки binding_key должен иметь такой же формат. Логика обмена сообщениями
//      будет аналогична распределителю типа direct, то есть сообщение, отправленное 
//      с определенным routing_key, будет доставлено во все очереди, связанные 
//      с соответствующим binding_key. 

// Есть два особых случая привязки ключей:
//      '*'     может заменить ровно одно слово;
//      '#'     может заменить ноль или более слов.

// Если binding_key будет иметь значение '#', то очередь потребителя будет получать 
//      все сообщения независимо от значения ключа routing_key, что соответствует 
//      поведению распределителя типа fanout.

// Если binding_key не содержит символы "*" и "#", то это будет соответствовать 
//      поведению распределителя типа direct.

// --- --- Пример.

// Producer отправляет сообщения с описанием животных. Ключ routing_key будет иметь 
//      формат: <speed>.<colour>.<species>, где speed - скорость, colour - цвет, 
//      species - вид. 

// Будет создано три привязки: 
// - Q1 интересуется всеми оранжевыми животными: 
//      Q1 связан с ключом *.orange.*
// - Q2 хочет услышать все о кроликах и все о ленивых животных:
//      Q2 связан с ключами *.*.rabbit и lazy.#

// Сообщения будут доставляться следующим образом:
//      quick.orange.rabbit          будет доставлено в обе очереди
//      lazy.orange.elephant         будет доставлено в обе очереди 
//      quick.orange.fox             попадет только в первую очередь
//      lazy.brown.fox               попадает только во вторую очередь
//      lazy.pink.rabbit             будет доставлен во вторую очередь один раз, 
//                                       даже если оно соответствует двум привязкам
//      quick.brown.fox              не соответствует ни одной привязке, поэтому 
//                                       оно будет удалено
//      orange                       не соответствует привязкам и будет потеряно
//      quick.orange.male.rabbit     не соответствует привязкам и будет потеряно
//      lazy.orange.male.rabbit      соответствует последнему связыванию и будет 
//                                       доставлено во вторую очередь

// Таким образом, если ключ содержит меньше критериев, чем установлено привязками,
//      то сообщение будет потеряно. Если ключ содержит больше критериев, 
//      чем установлено привязками, то лишние критерии отбрасываются.

// --- 5.3 Producer (emit_log_topic.js)

function topics_producer_callback() {
    console.log(`
        --- --- --- Topics: Producer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqp.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var exchange = 'topic_logs';
            var args = process.argv.slice(2);
            var key = (args.length > 0) ? args[0] : 'anonymous.info';
            var msg = args.slice(1).join(' ') || 'Hello World!';

            // 
            channel.assertExchange(exchange, 'topic', { durable: false });

            // ключи routing_key будут состоять из двух слов: <facility>.<severity>
            channel.publish(exchange, key, Buffer.from(msg));
            console.log(" [x] Sent %s: '%s'", key, msg);
        });

        setTimeout(function () {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

async function topics_producer_promise(msg, key) {
    console.log(`
        --- --- --- Topics: Producer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let exchange = 'topic_logs';

        // 
        const assertExchange = await channel.assertExchange(exchange, 'topic', { durable: false });
        console.log(`--- Producer.assertExchange --- assertExchange = ${JSON.stringify(assertExchange)}`);

        // ключи routing_key будут состоять из двух слов: <facility>.<severity>
        const isSend = await channel.publish(exchange, key, Buffer.from(msg));
        console.log(`--- Producer.sendToQueue 
            --- key = ${key}
            --- message "${msg}" is send: ${isSend}
        `);

        // 
        resolve();
    });
}

// --- 5.4 Consumer (receive_logs_topic.js)

function topics_producer_callback() {
    console.log(`
        --- --- --- Topics: Consumer. --- --- ---
    `);

    //    
    var args = process.argv.slice(2);
    if (args.length == 0) {
        console.log("Usage: receive_logs_topic.js <facility>.<severity>");
        process.exit(1);
    }

    // подключение к серверу RabbitMQ
    amqp.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var exchange = 'topic_logs';

            //
            channel.assertExchange(exchange, 'topic', { durable: false });

            // 
            channel.assertQueue('',
                { exclusive: true },
                function (err, q) {
                    if (err) throw err;

                    // ключи routing_key будут состоять из двух слов: <facility>.<severity>
                    args.forEach(function (key) {
                        channel.bindQueue(q.queue, exchange, key);
                    });

                    // 
                    channel.consume(q.queue,
                        function (msg) {
                            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                        },
                        { noAck: true }
                    );
                    console.log(' [*] Waiting for logs. To exit press CTRL+C');
                }
            );
        });
    });
}

async function topics_consumer_promise(levels, resultCallback) {
    console.log(`
        --- --- --- Topics: Consumer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        //
        var exchange = 'topic_logs';

        // 
        const assertExchange = await channel.assertExchange(exchange, 'topic', { durable: false });
        console.log(`--- Producer.assertExchange --- assertExchange = ${JSON.stringify(assertExchange)}`);

        //
        const assertQueue = await channel.assertQueue('', { exclusive: true });
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // ключи routing_key будут состоять из двух слов: <facility>.<severity>
        levels.forEach(function (key) {
            channel.bindQueue(assertQueue.queue, exchange, key);
        });

        // 
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

// --- Запуск.

// Получить все логи:
//      ./receive_logs_topic.js "#"

// Получить все логи от объекта kern:
//      ./receive_logs_topic.js "kern.*"

// Получить только критические логи:
//      ./receive_logs_topic.js "*.critical"

// Создать несколько привязок:
//      ./receive_logs_topic.js "kern.*" "*.critical"

// Создать журнал с ключом маршрутизации "kern.critical:
//      ./emit_log_topic.js "kern.critical" "A critical kernel error"

(async () => {

    let c = 0;
    const check = () => {
        if (++c >= 4) process.exit(0);
    };

    await topics_consumer_promise(
        ["guest.error", "admin.warning"],
        async (msg) => {
            console.log(`
                --- Consumer 1 --- complete
                --- content = ${msg.content.toString()} 
                --- routingKey: ${msg.fields.routingKey}
            `);
            check();
        }
    );

    await topics_consumer_promise(
        ["admin.info", "admin.error"],
        async (msg) => {
            console.log(`
                --- Consumer 2 --- complete
                --- content = ${msg.content.toString()} 
                --- routingKey: ${msg.fields.routingKey}
            `);
            check();
        }
    );

    await topics_producer_promise(`\n message '#': ${Math.random()}`, "#");
    await topics_producer_promise(`\n message 'guest.*': ${Math.random()}`, "guest.*");
    await topics_producer_promise(`\n message '*.error': ${Math.random()}`, "*.error");
    await topics_producer_promise(`\n message 'admin.warning': ${Math.random()}`, "admin.warning");
})();