const amqpPromise = require('amqplib');
const amqpCallback = require('amqplib/callback_api');



// --------------- 2. Work queues.

//      https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html

// Work queues - это очереди, которые используются для распределения трудоемких 
//      задач между несколькими рабочими процессами. Идея состоит в том, чтобы 
//      избежать немедленного выполнения сложных задач и ожидания их завершения.
//      Задачи инкапсулируются в виде сообщений и отправляются в очередь. Рабочие
//      процессы (Workers) извлекают задачи из очереди и выполняют в фоновом режиме.
//      Так нагрузка распределяется на несколько рабочих процесса. 

// Концепция 'Work queues' особенно полезна в веб-приложениях, где невозможно 
//      выполнить сложную задачу в течение небольшого времени обработки HTTP-запроса.

// --- 2.1 Diagram.

//                                          ╭───╮
//                                      ╭ → ┤ C │
//      ╭───╮   ┌───┬───┬───┬───┬───┐   │   ╰───╯
//      │ P ├ → ┤░░░│░░░│░░░│   │   ├ → ┤    
//      ╰───╯   └───┴───┴───┴───┴───┘   │   ╭───╮
//                                      ╰ → ┤ C │
//                                          ╰───╯

// --- 2.2 Message acknowledgments.

// Ack (message acknowledgments) - механизм подтверждения сообщений, который позволяет
//      RabbitMQ гарантировать, что сообщение никогда не будет потеряно. Consumer 
//      отправляет ack обратно RabbitMQ, чтобы сообщить, что сообщение было получено,
//      обработано и может быть удалено.

// Если Consumer умирает (канал закрыт, соединение закрыто или разорвано TCP-соединение)
//      без отправки подтверждения, то сообщение считается необработанным и будет 
//      направлено RabbitMQ обратно в очередь или другому потребителю. Таким образом, 
//      ни одно сообщение не будет потеряно.

// На подтверждение доставки накладывается временное ограничение, которое по умолчанию
//      составляет 30 минут. Это помогает обнаруживать зависших потребителей, которые 
//      никогда не подтверждают доставку.

// Включить подтверждение сообщений можно с помощью параметра 'noAck: false' передав
//      его в метод consume. Consumer может подтвердить сообщение вызвав метод ack 
//      на соответствующем канале. Если Consumer не будет подтверждать сообщения, 
//      то они будут доставлены повторно, когда Consumer завершит работу. Это может 
//      выглядеть как случайная повторная доставка. RabbitMQ не может удалять 
//      не подтвержденные сообщения, поэтому будет происходить постоянный рост 
//      используемой памяти. Чтобы отладить такую ​​ошибку следует использовать 
//      rabbitmqctl для вывода поля messages_unacknowledged:
//      sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged

// --- 2.3 Message durability.

// Если сервер RabbitMQ остановится или аварийно завершает работу, то все данные
//      об очередях и сообщениях будут удалены. Чтобы этого избежать следует 
//      пометить очередь и сообщения как надежные. 

// Чтобы пометить очередь следует передать параметр 'durable:true' в assertQueue: 
//      channel.assertQueue('hello', { durable: true });

// Чтобы пометить сообщение следует передать параметр 'persistent:true' в sendToQueue: 
//      channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

// Параметр persistent не гарантирует, что сообщение не будет потеряно. Существует
//      короткий промежуток времени между получением сообщения и его сохранением
//      на диск, когда оно может быть потеряно. Кроме того, RabbitMQ не выполняет 
//      fsync(2) для каждого сообщения, то есть сообщение может быть сохранено в кэше, 
//      а не записано на диск. Чтобы иметь больше гарантий сохранности следует
//      использовать 'Publisher Confirms'.

// --- 2.4 Consumer Acknowledgements and Publisher Confirms.

//      https://www.rabbitmq.com/confirms.html

// --- 2.5 Fair dispatch.

// По умолчанию RabbitMQ равномерно распределяет сообщения между потребителями, что 
//      может привести к ситуации, когда один потребитель получит несколько тяжелых
//      задач, а другой несколько легких. То есть сообщения будут распределены 
//      не равномерно с точки зрения трудоемкости и один рабочий процесс будет 
//      загружен на максимум, а другой будет часто находится в простое.

// RabbitMQ не смотрит на количество неподтвержденных сообщений для потребителя. 
//      Он просто слепо отправляет каждое n-е сообщение n-му потребителю.

// Чтобы избежать неравномерной загрузки следует вызвать метод prefetch 
//      со значением 1, что указывает RabbitMQ не отправлять более одного сообщения 
//      рабочему процессу за раз. Или, другими словами, не отправлять новое сообщение, 
//      пока рабочий процесс не обработает и не подтвердит предыдущее. Вместо этого 
//      сообщение будет отправлено следующему потребителю.

// Вызов метода prefetch:
//      channel.prefetch(1);

// --- 2.6 Producer (new_task.js)

function workQueues_producer_callback() {
    console.log(`
        --- --- --- Work Queues: Producer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var queue = 'task_queue';
            var msg = process.argv.slice(2).join(' ') || "Hello World!";

            // 
            channel.assertQueue(queue, { durable: true });

            // 
            channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
            console.log(" [x] Sent '%s'", msg);
        });

        // 
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

async function workQueues_producer_promise(msg, resultCallback) {
    console.log(`
        --- --- --- Work Queues: Producer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        let queue = 'task_queue';

        // объявление очереди для отправки
        const assertQueue = await channel.assertQueue(queue, { durable: true });
        console.log(`--- Producer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // опубликовать сообщение в очередь
        const isSend = channel.sendToQueue(queue, Buffer.from(msg),
            { persistent: true },
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

// --- 2.7 Consumer (worker.js)

function workQueues_consumer_callback() {
    console.log(`
        --- --- --- Work Queues: Consumer. --- --- ---
    `);

    // подключение к серверу RabbitMQ
    amqpCallback.connect('amqp://localhost', function (err, connection) {
        if (err) throw err;

        // 
        connection.createChannel(function (err, channel) {
            if (err) throw err;

            // 
            var queue = 'task_queue';

            // гарантирует, что очередь создана ​​перед ее использованием
            channel.assertQueue(queue, {
                durable: true
            });

            // 
            channel.prefetch(1);

            // 
            channel.consume(queue,
                (msg) => {

                    // В качестве сообщений используются строки, обозначающие сложные задачи.
                    //      Количество точек в строке обозначает сложность. Каждая точка 
                    //      составляет одну секунду нагрузки.
                    var secs = msg.content.toString().split('.').length - 1;

                    // 
                    setTimeout(function () {
                        console.log("--- [x] Done");

                        // подтверждение, что сообщение обработано
                        channel.ack(msg);
                    }, secs * 1000);
                    console.log("--- [x] Received %s", msg.content.toString());
                },
                {
                    // режим автоматического подтверждения
                    noAck: false
                }
            );
            console.log("--- [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        });
    });
}

async function workQueues_consumer_promise(number, resultCallback) {
    console.log(`
        --- --- --- Work Queues: Consumer. --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // подключение к серверу RabbitMQ
        const connection = await amqpPromise.connect('amqp://localhost');

        // создается канал 
        const channel = await connection.createChannel();

        // 
        var queue = 'task_queue';

        // гарантирует, что очередь создана ​​перед ее использованием
        const assertQueue = await channel.assertQueue(
            queue,
            // сохраняет очередь 
            { durable: true }
        );
        console.log(`--- Consumer.assertQueue --- assertQueue = ${JSON.stringify(assertQueue)}`);

        // принимает на обработку только одно сообщение
        channel.prefetch(1);

        // метод consume асинхронно ожидает сообщений от Producer
        const consume = await channel.consume(queue,
            (msg) => {

                // В качестве сообщений используются строки, обозначающие сложные задачи.
                //      Количество точек в строке обозначает сложность. Каждая точка 
                //      составляет одну секунду нагрузки.
                let secs = msg.content.toString().split('.').length - 1;

                // 
                setTimeout(function () {
                    
                    // подтверждение, что сообщение обработано
                    channel.ack(msg);

                    // 
                    console.log(`--- Consumer ${number} --- message: ${msg.content.toString()} --- seconds: ${secs} --- Complete`);
                    resultCallback()
                }, secs * 200);
            },
            {
                // режим автоматического подтверждения
                noAck: false
            }
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

// Преимуществои использования очереди задач является масштабируемость за счет 
//      создания новых рабочих процессов. По умолчанию RabbitMQ последовательно 
//      отправляет каждое сообщение следующему потребителю. В среднем каждый 
//      потребитель получит одинаковое количество сообщений. Такой способ 
//      распространения сообщений называется 'round-robin dispatching'. 

// Запуск двух Consumer:
//      # shell 1
//          ./worker.js
//          # => [*] Waiting for messages. To exit press CTRL+C
//      # shell 2
//          ./worker.js
//          # => [*] Waiting for messages. To exit press CTRL+C

// Запуск Producer и отправка нескольких сообщений: 
//      # shell 3
//          ./new_task.js First message.
//          ./new_task.js Second message..
//          ./new_task.js Third message...
//          ./new_task.js Fourth message....
//          ./new_task.js Fifth message.....

// Приблизительный результат работы: 
//      # shell 1
//          ./worker.js
//          # => [*] Waiting for messages. To exit press CTRL+C
//          # => [x] Received 'First message.'
//          # => [x] Received 'Third message...'
//          # => [x] Received 'Fifth message.....'
//      # shell 2
//          ./worker.js
//          # => [*] Waiting for messages. To exit press CTRL+C
//          # => [x] Received 'Second message..'
//          # => [x] Received 'Fourth message....'

(async () => {

    let fc = 0, sc = 0;
    const check = () => {
        if (fc + sc >= 5) process.exit(0);
    };

    await workQueues_consumer_promise(1, () => check(++fc, sc));
    await workQueues_consumer_promise(2, () => check(fc, ++sc));

    await workQueues_producer_promise('First message.', () => console.log(`--- 1. seconds = 1`));
    await workQueues_producer_promise('Second message..', () => console.log(`--- 2. seconds = 2`));
    await workQueues_producer_promise('Third message...', () => console.log(`--- 3. seconds = 3`));
    await workQueues_producer_promise('Fourth message....', () => console.log(`--- 4. seconds = 4`));
    await workQueues_producer_promise('Fifth message.....', () => console.log(`--- 5. seconds = 5`));
})();