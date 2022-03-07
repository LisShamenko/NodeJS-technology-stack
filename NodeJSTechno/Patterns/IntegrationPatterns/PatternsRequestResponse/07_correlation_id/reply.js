"use strict";

console.log(`--- reply`);

// Пример реализует абстракцию для обертывания канала, соединяющего родительский и 
//      дочерний процессы. Эта абстракция должна обеспечить связь вида 'Запрос/ответ', 
//      автоматически маркируя каждый запрос идентификатором и затем сопоставляя 
//      идентификатор ответа со списком ожидающих ответа запросов.

// фабрика возвращает функцию для регистрации новых обработчиков ответов
function replyFactory(channel) {

    console.log(`--- reply factory`);

    // функция регистрации обработчиков ответов
    return function registerHandler(handler) {

        console.log(`--- register handler`);

        // прием входящих сообщений
        channel.on('message', message => {

            console.log(`--- message: ${JSON.stringify(message)}`);

            // 
            if (message.type !== 'request') {
                return;
            }

            console.log(`--- call handler`);

            // при получении сообщений вызывается обработчик handler, которому передаются 
            //      данные из сообщения и функция обратного вызова для возврата ответа из 
            //      обработчика
            handler(message.data, reply => {

                console.log(`--- handler callback`);

                // завершая работу, обработчик вызовет переданную ему функцию и передаст ей
                //      свои результаты, далее создается пакет, куда включается идентификатор 
                //      корреляции запроса, который передается обратно в канал
                channel.send({
                    type: 'response',
                    data: reply,
                    // идентификатор корреляции запроса
                    inReplyTo: message.id
                });
            });
        });
    };
};

// 
module.exports.replyFactory = replyFactory;