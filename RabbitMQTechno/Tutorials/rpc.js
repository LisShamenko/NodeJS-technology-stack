const amqpPromise = require('amqplib');
const amqpCallback = require('amqplib/callback_api');



// --------------- 6. RPC.

//      https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html

// RPC (Remote Procedure Call) - удаленный вызов процедур клиентом на стороне 
//      сервера.

// RPC могут вносить путаницу в систему, поскольку неизвестно, является ли вызов 
//      функции локальным или это медленный RPC. Это приводит к непредсказуемости 
//      системы и усложняет отладку. Вместо того, чтобы упростить программное 
//      обеспечение, неправильное использование RPC может привести к спагетти-коду.

// Ряд советов по использованию RPC: 
// - следует понимать, какие вызовы функций являются локальными, а какие удалённые;
// - следует документировать систему, чтобы сделать взаимосвязи между компонентами 
//      явными;
// - следует обрабатывать специфичные ошибки, связанные с отключением сервера RPC.

// В случае сомнений следует избегать использование RPC, которые можно заменить 
//      на использование асинхронного конвейера. 

// --- 6.1 Diagram.

//                 ┌─────────────────────────┐ 2.  3. rpc_queue
//                 │         Request         └─┐   ┌───┬───┬───┬───┬───┐
//        ╭─── → ──┤ reply_to=amqp.gen-Xa2...  ├ → ┤░░░│░░░│░░░│   │   ├── → ───╮
//     1. │ Client │    correlation_id=abc     │   └───┴───┴───┴───┴───┘ Server │ 
//      ╭─┴─╮╱     └───────────────────────────┘                             ╲╭─┴─╮
//      │ C │      ┌───────────────────┐ 5.        4. reply_to=amq.gen-Xa2... │ S │
//      ╰─┬─╯      │       Reply       └─┐         ┌───┬───┬───┬───┬───┐      ╰─┬─╯
//        ╰─── ← ──┤ correlation_id=abc  ├─── ← ───┤░░░│░░░│░░░│   │   ├── ← ───╯
//                 └─────────────────────┘         └───┴───┴───┴───┴───┘

// Работа RPC:
// 1. Когда клиент запускается, он создает очередь для обратных вызовов RPC.
// 2. Запрос RPC - это сообщение с двумя свойствами: 
//      reply_to - указывает на очередь обратных вызовов;
//      correlation_id - уникальное значение для каждого запроса.
// 3. Запрос отправляется в очередь rpc_queue.
// 4. Рабочий процесс на стороне сервера ожидает RPC запросы, обрабатывает их и 
//      отправляет сообщение с результатами обратно клиенту, используя очередь,
//      указанную в поле reply_to.
// 5. Клиент прослушывает очередь обратных вызовов и проверяет свойство correlation_id
//      входных сообщений. Если correlation_id соответствует значению из запроса, то
//      клиент возвращает ответ приложению.

// --- 6.2 Message properties.

// Протокол 'AMQP 0-9-1' определяет набор из 14 свойств, которые сопровождают 
//      сообщение. Большинство свойств используются редко, за исключением следующих:
//      persistent      - true помечает сообщение как persistent, иначе как transient;
//      content_type    - описание MIME-типа кодировки, например, для часто используемой 
//                          кодировки JSON рекомендуется установить 'application/json';
//      reply_to        - используется для обозначения очереди обратных вызовов;
//      correlation_id  - используется для сопоставления ответов RPC с запросами.

// --- 6.3 Correlation Id.

// Для каждого клиента создается отдельная очередь обратных вызовов. Для того,
//      чтобы понять к какому запросу относится ответ используется свойство 
//      Correlation_id. Эт освойство принимает уникальное значение для каждого
//      запроса, что позволяет сопоставить ответ с запросом в очереди обратных
//      вызовов. Если будет обнаружено неизвестное значение Correlation_id, 
//      то сообщение будет отброшено, поскольку не связано с запросами в очереди.

// Неизвестные сообщения в очереди обратных вызовов следует именно игнорировать, а
//      не выдавать ошибку, поскольку может возникнуть состояние гонки на стороне
//      сервера. Маловероятна, но возможна ситуация, когда сервер RPC умрет сразу 
//      после отправки ответа клиенту, но до подтверждения сообщения. В этом случае,
//      перезапущенный сервер повторно обработает запрос, что вызывает у клиента
//      повторное получение результата RPC. Поэтому клиент всегда должен корректно 
//      обрабатывать повторяющиеся ответы.

// --- 6.4 RPC-сервер (rpc_server.js)

// Код сервера:
//      - установка соединения, создание канала и очереди;
//      - чтобы равномерно распределить нагрузку по нескольким серверам, 
//          следует установить настройку prefetch;
//      - метод Channel.consume принимает сообщение из очереди, затем
//          выполняется полезная нагрузка в функции обратного вызова и 
//          результат вычислений отправляется обратно.

// медленная рекурсивная реализация функции Фибоначчи
function fibonacci(n) {
    if (n === 0 || n === 1)
        return n;
    else
        return fibonacci(n - 1) + fibonacci(n - 2);
}

function rpc_server_callback() {
    console.log(`
        --- --- --- RPC: Server. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        //
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            //
            var queue = 'rpc_queue';

            //
            channel.assertQueue(queue, { durable: false });

            // 
            channel.prefetch(1);

            // 
            channel.consume(queue, function reply(msg) {

                // 
                var n = parseInt(msg.content.toString());
                console.log(" [.] fib(%d)", n);
                var r = fibonacci(n);

                // клиент отправляет сообщение запроса, а сервер отвечает ответным 
                //      сообщением; чтобы получить ответ, нам нужно отправить адрес 
                //      очереди обратного вызова с запросом; можно использовать 
                //      Exchange по умолчанию;
                channel.sendToQueue(msg.properties.replyTo,
                    Buffer.from(r.toString()), {
                    correlationId: msg.properties.correlationId
                });

                // 
                channel.ack(msg);
            });
            console.log(' [x] Awaiting RPC requests');
        });
    });
}

async function rpc_server_promise() {
    console.log(`
        --- --- --- RPC: Server. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let queue = 'rpc_queue';

        // создать очередь RPC
        const assertQueue = await channel.assertQueue(queue, { durable: false });
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // 
        channel.prefetch(1);

        // сервер принимает RPC от клиента через очередь RPC
        const consume = await channel.consume(queue, (msg) => {

            // выполнение RPC
            var n = parseInt(msg.content.toString());
            var r = fibonacci(n);
            console.log(`--- 2. Сервер: выполнение RPC, number = ${n}, result = ${r}.`);

            // клиент отправляет сообщение запроса, а сервер отвечает ответным 
            //      сообщением; чтобы получить ответ, нам нужно отправить адрес 
            //      очереди обратного вызова с запросом; можно использовать 
            //      Exchange по умолчанию;
            channel.sendToQueue(
                // отправить сообщение в очередь указанную клиентом в RPC
                msg.properties.replyTo,
                Buffer.from(r.toString()),
                // в качестве передаваемых опций указать идентификатор сопоставления
                { correlationId: msg.properties.correlationId }
            );
            console.log(`--- 3. Сервер: отправка результата клиенту.`);

            // 
            channel.ack(msg);
        });
        console.log(`--- Consumer.consume --- consume.consumerTag = ${consume.consumerTag}`);

        // 
        resolve();
    });
}

// --- 6.5 RPC-клиент (rpc_client.js)

function generateUuid() {
    return `${Math.random()}${Math.random()}${Math.random()}`;
}

function rpc_client_callback() {
    console.log(`
        --- --- --- RPC: Client. --- --- ---
    `);

    // 
    var args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: rpc_client.js num");
        process.exit(1);
    }

    //
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        //
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            //
            channel.assertQueue('',
                { exclusive: true },
                function (err, q) {
                    if (err) throw err;

                    // 
                    var correlationId = generateUuid();
                    var num = parseInt(args[0]);

                    // 
                    channel.consume(q.queue,
                        function (msg) {
                            if (msg.properties.correlationId === correlationId) {
                                console.log(' [.] Got %s', msg.content.toString());
                                setTimeout(function () {
                                    connection.close();
                                    process.exit(0);
                                }, 500);
                            }
                        },
                        { noAck: true }
                    );

                    // 
                    channel.sendToQueue('rpc_queue',
                        Buffer.from(num.toString()),
                        {
                            correlationId: correlationId,
                            replyTo: q.queue
                        }
                    );
                    console.log(' [x] Requesting fib(%d)', num);
                }
            );
        });
    });
}

async function rpc_client_promise(number) {
    console.log(`
        --- --- --- RPC: Client. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        //
        const assertQueue = await channel.assertQueue('', { exclusive: true });
        console.log(`--- Client.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // 
        let correlationId = generateUuid();

        // 
        const consume = await channel.consume(assertQueue.queue,
            (msg) => {
                console.log(`--- 4. Клиент: получение ответа от сервера.`);

                // сопоставление идентификаторов
                if (msg.properties.correlationId === correlationId) {
                    console.log(`--- 5. Клиент: идентификаторы совпали, 
                        результат RPC: ${msg.content.toString()}.
                    `);
                    connection.close();
                    process.exit(0);
                }
            },
            { noAck: true }
        );
        console.log(`--- Client.consume --- consume.consumerTag = ${consume.consumerTag}`);

        // отправляет запрос RPC
        channel.sendToQueue(
            'rpc_queue',
            Buffer.from(number.toString()),
            {
                // идентификатор для сопоставления запроса RPC и ответа RPC
                correlationId: correlationId,
                // очередь, которая будет обрабатывать RPC
                replyTo: assertQueue.queue
            }
        );
        console.log(`--- 1. Клиент: отправка RPC.`);

        // 
        resolve();
    });
}

// --- Запуск.

// Запуск сервера RPC:
//      ./rpc_server.js
//          # => [x] Awaiting RPC requests

// Запуск клиента:
//      ./rpc_client.js 30
//          # => [x] Requesting fib(30)

// Представленный дизайн имеет ряд важных преимуществ:
// - если сервер RPC слишком медленный, то его можно легко масштабировать, запустив
//      несколько дополнительных экземпляров;
// - на стороне клиента для отправки RPC требуется отправить и получить только
//      одно сообщение, то есть клиенту требуется только одна сетевая передача 
//      для одного запроса RPC;

// Приведенный код довольно простой и не пытается решать более сложные проблемы:
//      Как должен реагировать клиент, если сервер RPC не запущен?
//      Должен ли клиент иметь тайм-аут для RPC?
//      Если сервер дает сбой, то следует ли передавать клиенту исключение?
//      Защита от недопустимых входящих сообщений перед обработкой.

(async () => {
    await rpc_server_promise();
    await rpc_client_promise(30);
})();