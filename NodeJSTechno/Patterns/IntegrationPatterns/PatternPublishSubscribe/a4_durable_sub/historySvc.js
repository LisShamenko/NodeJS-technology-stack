"use strict";

// monotonic-timestamp
//      https://npmjs.org/package/monotonic-timestamp

// 
const amqp = require('amqplib');
const JSONStream = require('JSONStream');
const timestamp = require('monotonic-timestamp');

// 
const http = require('http');
const level = require('level');
const db = level('./../../../dist/416/history');

// 
async function createHistoryServer(port) {
    return new Promise(async (resolve, reject) => {

        // --- server

        // HTTP­ сервер для передачи истории чата клиентам
        const server = http.createServer(
            (req, res) => {
                res.writeHead(200);

                // 
                db.createValueStream()
                    .pipe(JSONStream.stringify())
                    .pipe(res);
            }
        )

        // --- amqp

        // AMQP потребитель отвечает за сбор сообщений чата и сохранение их 
        //      в локальной базе данных
        let channel, queue;
        amqp
            // устанавливается соединение с брокером AMQP - RabbitMQ
            .connect('amqp://localhost')
            // создается канал, похожий на сеанс, для поддержки состояния взаимодействий
            .then(conn => {
                console.log(`--- connect to channel`);
                return conn.createChannel();
            })
            .then(ch => {
                channel = ch;

                // - создается разветвляющий коммутатор chat
                // - команда assertExchange проверяет наличие готового коммутатора в брокере, 
                //      если коммутатор отсутствует, он будет создан
                return channel.assertExchange('chat', 'fanout');
            })
            // создается надежная очередь chat_history, которая не удаляется автоматически,
            //      поэтому нет необходимости указывать дополнительные параметры 
            //      для поддержки надежных подписчиков
            .then(() => {
                console.log(`--- chat history`);
                return channel.assertQueue('chat_history');
            })
            .then((q) => {
                queue = q.queue;

                // очередь связывается с созданным ранее коммутатором, параметры не нужны (ключ
                //      маршрутизации или шаблон), поскольку разветвляющее коммутирование 
                //      не выполняет никакой фильтрации
                return channel.bindQueue(queue, 'chat');
            })
            .then(() => {
                // прием сообщений из только что созданной очереди
                return channel.consume(queue, msg => {
                    const content = msg.content.toString();
                    console.log(`--- save message: ${content}`);

                    // сообщения сохраняются в базе данных LevelDB с использованием отметок времени
                    //      в качестве ключей, чтобы обеспечить их сортировку по дате и времени
                    db.put(timestamp(), content, err => {
                        if (!err) {
                            // вызов channel.ack подтверждает прием сообщения только после успешного
                            //      сохранения сообщения в базе данных, если брокер не получит 
                            //      подтверждения, сообщение остается в очереди для повторной обработки, 
                            //      что обеспечивает надежность службы на высоком уровне
                            // - если не требуется явно подтверждать прием сообщений, можно передать 
                            //      параметр 'noAck:true' в вызов channel.consume
                            channel.ack(msg);
                        }
                    });
                });
            })
            .catch(err => {
                console.log(`--- err = ${err}`);
            });

        // --- listen

        server.listen(port, () => {
            console.log(`--- http://localhost:${port}`);
            resolve(server);
        });
    });
}

// 
module.exports.createHistoryServer = createHistoryServer;