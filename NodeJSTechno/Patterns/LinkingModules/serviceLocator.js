"use strict";

module.exports = () => {
    const dependencies = {};
    const factories = {};
    const serviceLocator = {};

    // используется для связывания имени компонента с фабрикой
    serviceLocator.factory = (name, factory) => {
        factories[name] = factory;
    };

    // используется для связывания имени компонента непосредственно с экземпляром
    serviceLocator.register = (name, instance) => {
        dependencies[name] = instance;
    };

    // извлекает компонент по его имени
    serviceLocator.get = (name) => {
        // проверяет наличие компонента, либо создает новый через найденную фабрику
        if (!dependencies[name]) {
            const factory = factories[name];
            
            // фабрики модулей вызываются путем внедрения текущего экземпляра 
            //      локатора служб, этот механизм обеспечивает построение графа 
            //      зависимостей
            dependencies[name] = factory && factory(serviceLocator);
            if (!dependencies[name]) {
                throw new Error(`--- Cannot find module: ${name}`);
            }
        }
        return dependencies[name];
    };

    return serviceLocator;
};

// Упрощенный вариант шаблона использует объект в качестве пространства имен 
//      для набора зависимостей:
//      
//      const dependencies = {};
//      const db = require('./lib/db');
//      const authService = require('./lib/authService');
//      dependencies.db = db();
//      dependencies.authService = authService(dependencies);