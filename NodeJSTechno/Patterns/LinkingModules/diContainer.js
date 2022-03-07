"use strict";

// используется для извлечения имен аргументов функции
const fnArgs = require('parse-fn-args');

// 
module.exports = () => {

    // 
    const dependencies = {};
    const factories = {};
    const diContainer = {};

    // 
    diContainer.factory = (name, factory) => {
        factories[name] = factory;
    };

    // 
    diContainer.register = (name, dep) => {
        dependencies[name] = dep;
    };

    //
    diContainer.get = (name) => {
        if (!dependencies[name]) {
            const factory = factories[name];
            dependencies[name] = factory &&
                diContainer.inject(factory);
            if (!dependencies[name]) {
                throw new Error(`--- Cannot find module: ${name}`);
            }
        }
        return dependencies[name];
    };

    // определяет зависимости модуля и использует их для вызова фабрики
    diContainer.inject = (factory) => {

        // библиотека parse-fn-args извлекает список аргументов указанной 
        //      фабричной функции
        const args = fnArgs(factory)
            .map(function (dependency) {
                // имя каждого аргумента отображается в экземпляр зависимости, 
                //      полученный с помощью метода get
                return diContainer.get(dependency);
            });

        // полученный список зависимостей просто передается в вызов фабрики
        return factory.apply(null, args);
    };

    return diContainer;
};