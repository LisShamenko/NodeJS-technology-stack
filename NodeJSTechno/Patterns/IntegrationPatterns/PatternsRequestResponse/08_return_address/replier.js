"use strict";

console.log(`--- replier`);

// 
const Reply = require('./amqpReply');

// требуется только инициализировать новый объект reply, указав 
//      имя очереди 'requests_queue' для получения запросов
const reply = Reply('requests_queue');

// созданная абстракция позволяет скрыть все механизмы обработки 
//      идентификатора корреляции и обратного адреса
reply.initialize().then(() => {
    console.log(`--- reply then`);

    // 
    reply.handleRequest((req, cb) => {
        console.log(`--- request handler: ${req}`);

        // 
        cb({
            sum: req.a + req.b
        });
    });
});
