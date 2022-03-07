"use strict";

console.log(`--- replier`);

// 
const { replyFactory } = require('./reply');
const reply = replyFactory(process);

// пример отвечающей стороны
reply((req, cb) => {

    console.log(`--- reply`);

    // возвращает результат после некоторой задержки (req.delay), что позволяет 
    //      изменить порядок возврата ответов, чтобы он отличался от порядка 
    //      отправки запросов, с целью удостовериться в правильной работе шаблона
    setTimeout(
        () => {

            console.log(`
                --- timeout --- 
            `);

            cb({
                sum: req.a + req.b,
            });
        },
        req.delay
    );
});