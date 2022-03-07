"use strict";

// асинхронный модуль
const AsyncModuleFactory = require('./AsyncModuleFactory');
const asyncModule = AsyncModuleFactory(1000);

// создается объект, передающий операции активному модулю activeState
const asyncModuleWrapper = module.exports;

// флаг инициализации
asyncModuleWrapper.initialized = false;

// оболочка делегирует вызовы своих методов активному модулю activeState
asyncModuleWrapper.initialize = function () {
    activeState.initialize.apply(activeState, arguments);
};
asyncModuleWrapper.echo = function () {
    activeState.echo.apply(activeState, arguments);
};

// когда оригинальный модуль asyncModule еще не инициализирован, обертка ставит
//      в очередь все полученные запросы, после завершения инициализации 
//      она выполняет все операции из очереди и потом переключает внутреннее 
//      состояние в initializedState

// очередь, в которой сохраняютя вызовы
let pending = [];

// состояния
let notInitializedState = {

    // метод-обертка для функции инициализации
    initialize: function (callback) {

        // запускает инициализацию оригинального модуля asyncModule, передавая метод 
        //      прокси ­объекта как функцию обратного вызова, что позволяет обертке 
        //      отреагировать на завершение инициализации оригинального модуля,
        //      состояние для передачи операций оригинальному модулю asyncModule 
        //      после завершения его инициализации
        asyncModule.initialize(function () {

            // инициализация завершена
            asyncModuleWrapper.initalized = true;

            // перейти к следующему состоянию
            activeState = initializedState;

            // выполнить все команды в очереди
            pending.forEach(function (req) {
                asyncModule[req.method].apply(null, req.args);
            });
            pending = [];

            // вызвать оригинальную функцию обратного вызова
            callback();
        });
    },

    // метод-обертка для реальных операций, состояние для постановки в очередь 
    //      всех операций, пока модуль не инициализирован
    echo: function (callback) {
        console.log(`--- push to queue! --- ${new Date()}`);
        return pending.push({
            method: 'echo',
            args: arguments
        });
    }
};

// ссылка на оригинальный модуль asyncModule, после завершения инициализации 
//      любые запросы следует направлять оригинальному модулю
let initializedState = asyncModule;

// установить начальное состояние: модуль не инициализирован
let activeState = notInitializedState;
