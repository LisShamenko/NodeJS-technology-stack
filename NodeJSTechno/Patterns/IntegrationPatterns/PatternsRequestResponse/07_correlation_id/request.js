"use strict";

console.log(`--- request`);

//
const { v4 } = require('uuid');

// 
function requestFactory(channel) {

    console.log(`--- request factory`);

    // вокруг функции request создается замыкание, переменная idToCallbackMap
    //      обеспечивает связь между запросами и обработчиками ответов
    const idToCallbackMap = {};

    // с момента вызова фабрики начинается прием входящих сообщений
    channel.on('message', message => {

        console.log(`--- request message: ${JSON.stringify(message)}`);

        // ответ будет получен, если идентификатор корреляции в сообщении (inReplyTo) 
        //      соответствует одному из хранящихся в переменной idToCallbackMap, тогда
        //      извлекается ссылка на обработчик, связанный с ответом
        const handler = idToCallbackMap[message.inReplyTo];
        if (handler) {
            // вызов обработчика handler с передачей данных, содержащихся в сообщении
            handler(message.data);
        }
    });

    // функция для отправки новых запросов
    return function sendRequest(req, callback) {

        console.log(`--- send request`);

        // генерация идентификатора корреляции
        const correlationId = v4();
        idToCallbackMap[correlationId] = callback;

        // данные запроса с идентификатором корреляции и типом сообщения 
        //      объединяются в общий пакет
        channel.send({
            type: 'request',
            data: req,
            id: correlationId
        });
    };
};

// 
module.exports.requestFactory = requestFactory;