module.exports = (chapters) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    // --------------- Базовые паттерны NodeJS.
    if (isChapter(1)) {
        // 1. Паттерн Callback.
        require('./Patterns/MainPatterns/patternCallback');
        // 2. Паттерн Revealing Module.
        require('./Patterns/MainPatterns/patternRevealingModule');
        // 3. Паттерн Observer.
        require('./Patterns/MainPatterns/patternObserver');
        // 4. Паттерн Reactor.
        require('./Patterns/MainPatterns/patternReactor');
    }

    // --------------- Паттерны управления потоком асинхронного выполнения.
    if (isChapter(2)) {
        // 5. Кастомные реализации паттернов управления.
        require('./Patterns/WоrkflоwPatterns/customVersion');
        // 6. Библиотека Async.
        require('./Patterns/WоrkflоwPatterns/asyncPackage');
        // 7. Promises.
        require('./Patterns/WоrkflоwPatterns/promises');
        // 8. Generators.
        require('./Patterns/WоrkflоwPatterns/generators');
        // 9. Использование async/await.
        require('./Patterns/WоrkflоwPatterns/useAsyncAwait');
        // 10. Сравнение методов выполнения асинхронных задач.
    }

    // --------------- Потоки.
    if (isChapter(3)) {
        // 11. Потоки данных (streams).
        require('./Patterns/DataStreams/beginningStreams');
        // 12. Работа с потоками данных.
        require('./Patterns/DataStreams/streams');
        // 13. Управление асинхронным выполнением с помощью потоков. 
        require('./Patterns/DataStreams/asyncStreams');
        // 14. Шаблоны конвейерной обработки.
        require('./Patterns/DataStreams/pipelineTemplates');
    }

    // --------------- Шаблоны проектирования.
    if (isChapter(4)) {
        // 15. Фабрика (Factory).
        require('./Patterns/GoF/factory');
        // 16. Открытый конструктор (Revealing Constructor).
        require('./Patterns/GoF/revealingConstructor');
        // 17. Прокси (proxy).
        require('./Patterns/GoF/proxy');
        // 18. Декоратор (decorator).
        require('./Patterns/GoF/decorator');
        // 19. Адаптер (adapter).
        require('./Patterns/GoF/adapter');
        // 20. Стратегия (strategy).
        require('./Patterns/GoF/strategy');
        // 21. Состояние (state).
        require('./Patterns/GoF/state');
        // 22. Макет (template).
        require('./Patterns/GoF/template');
        // 23. Промежуточное программное обеспечение (middleware).
        require('./Patterns/GoF/middleware_koa');
        // 24. Команда (command).
        require('./Patterns/GoF/command');
    }

    // --------------- Связывание модулей
    if (isChapter(5)) {
        // 25. Жесткие зависимости.
        require('./Patterns/LinkingModules/PureTemplates/hard_coded_dependency/app');
        // 26. Инверсия зависимостей.
        require('./Patterns/LinkingModules/PureTemplates/dependency_injection/app');
        // 27. DI-контейнер.
        require('./Patterns/LinkingModules/PureTemplates/di_container/app');
        // 28. Локатор служб.
        require('./Patterns/LinkingModules/PureTemplates/service_locator/app');
        // 29. Локатор служб Express.
        require('./Patterns/LinkingModules/PureTemplates/service_locator_express/app');
        // 30. Плагин: доступ к службам через жесткие зависимости.
        require('./Patterns/LinkingModules/PluginTemplates/hard_coded_dependency/app');
        // 31. Плагин: инверсия зависимостей.
        require('./Patterns/LinkingModules/PluginTemplates/dependency_injection/app');
        // 32. Плагин: DI-контейнер
        require('./Patterns/LinkingModules/PluginTemplates/di_container/app');
        // 33. Плагин: локатор служб.
        require('./Patterns/LinkingModules/PluginTemplates/service_locator/app');
    }

    // --------------- Асинхронная обработка модулей.
    if (isChapter(6)) {
        // 34. Асинхронная инициализаия модулей.
        require('./Patterns/AsynchronousPatternsAdditional/asyncInit');
        // 35. Группировка и кэширование асинхронных операций.
        require('./Patterns/AsynchronousPatternsAdditional/batchingCaching');
        // 36. Дочерние процессы.
        require('./Patterns/AsynchronousPatternsAdditional/cpuBound');
    }
};