"use strict";

// модуль преобразован в фабрику для простоты тестирования, в реальном примере 
//      зависимости загружаются при помощи require:
//
//      const Routes = require('./routes');
//      const asyncModule = require('./asyncModule');

// преобразована в фабрику для тестирования
module.exports = (delay) => {

    let initialized = false;

    return {
        // имитация асинхронной инициализации с длительной задержкой для теста
        initialize: callback => {
            setTimeout(() => {
                initialized = true;
                callback();
            }, delay);
        },

        // если модуль инициализирован, то возвращает текущее время, 
        //      иначе возбуждает исключение
        echo: callback => {
            process.nextTick(() => {
                if (!initialized) {
                    return callback(new Error('--- planned error'));
                }
                callback(null, '--- echo successful');
            });
        },
    };
}

/*
//
const asyncModule = module.exports;

//
asyncModule.initialized = false;

// имитация асинхронной инициализации с 10 секундной задержкой
asyncModule.initialize = callback => {
    setTimeout(() => {
        asyncModule.initialized = true;
        callback();
    }, 10000);
};

// если модуль инициализирован, то возвращает текущее время,
//      иначе возбуждает исключение
asyncModule.tellMeSomething = callback => {
    process.nextTick(() => {
        if (!asyncModule.initialized) {
            return callback(
                new Error('I don\'t have anything to say right now')
            );
        }
        callback(null, 'Current time is: ' + new Date());
    });
};
*/