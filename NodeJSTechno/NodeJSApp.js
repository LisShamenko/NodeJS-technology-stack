module.exports = async (chapters, examples) => {

    const isChapter = (c) => {
        return (chapters.length === 0 || chapters.find(i => i === c));
    }

    const isExample = (e) => {
        return (examples.find(i => i === e));
    }

    // --------------- Базовые паттерны NodeJS.
    if (isChapter(1)) {

        // 1. Паттерн Callback.
        if (isExample(1))
            require('./Patterns/MainPatterns/patternCallback');

        // 2. Паттерн Revealing Module.
        if (isExample(2))
            require('./Patterns/MainPatterns/patternRevealingModule');

        // 3. Паттерн Observer.
        if (isExample(3))
            require('./Patterns/MainPatterns/patternObserver');

        // 4. Паттерн Reactor.
        if (isExample(4))
            require('./Patterns/MainPatterns/patternReactor');
    }

    // --------------- Паттерны управления потоком асинхронного выполнения.
    if (isChapter(2)) {

        // 5. Кастомные реализации паттернов управления.
        if (isExample(5))
            require('./Patterns/WоrkflоwPatterns/customVersion');

        // 6. Библиотека Async.
        if (isExample(6))
            require('./Patterns/WоrkflоwPatterns/asyncPackage');

        // 7. Promises.
        if (isExample(7))
            require('./Patterns/WоrkflоwPatterns/promises');

        // 8. Generators.
        if (isExample(8))
            require('./Patterns/WоrkflоwPatterns/generators');

        // 9. Использование async/await.
        if (isExample(9))
            require('./Patterns/WоrkflоwPatterns/useAsyncAwait');

        // 10. Сравнение методов выполнения асинхронных задач.
    }

    // --------------- Потоки.
    if (isChapter(3)) {

        // 11. Потоки данных (streams).
        if (isExample(11))
            require('./Patterns/DataStreams/beginningStreams');

        // 12. Работа с потоками данных.
        if (isExample(12))
            require('./Patterns/DataStreams/streams');

        // 13. Управление асинхронным выполнением с помощью потоков. 
        if (isExample(13))
            require('./Patterns/DataStreams/asyncStreams');

        // 14. Шаблоны конвейерной обработки.
        if (isExample(14))
            require('./Patterns/DataStreams/pipelineTemplates');
    }

    // --------------- Шаблоны проектирования.
    if (isChapter(4)) {

        // 15. Фабрика (Factory).
        if (isExample(15))
            require('./Patterns/GoF/factory');

        // 16. Открытый конструктор (Revealing Constructor).
        if (isExample(16))
            require('./Patterns/GoF/revealingConstructor');

        // 17. Прокси (proxy).
        if (isExample(17))
            require('./Patterns/GoF/proxy');

        // 18. Декоратор (decorator).
        if (isExample(18))
            require('./Patterns/GoF/decorator');

        // 19. Адаптер (adapter).
        if (isExample(19))
            require('./Patterns/GoF/adapter');

        // 20. Стратегия (strategy).
        if (isExample(20))
            require('./Patterns/GoF/strategy');

        // 21. Состояние (state).
        if (isExample(21))
            require('./Patterns/GoF/state');

        // 22. Макет (template).
        if (isExample(22))
            require('./Patterns/GoF/template');

        // 23. Промежуточное программное обеспечение (middleware).
        if (isExample(23))
            require('./Patterns/GoF/middleware_koa');

        // 24. Команда (command).
        if (isExample(24))
            require('./Patterns/GoF/command');
    }

    // --------------- Связывание модулей
    if (isChapter(5)) {

        // 25. Жесткие зависимости.
        if (isExample(25))
            require('./Patterns/LinkingModules/PureTemplates/hard_coded_dependency/app');

        // 26. Инверсия зависимостей.
        if (isExample(26))
            require('./Patterns/LinkingModules/PureTemplates/dependency_injection/app');

        // 27. DI-контейнер.
        if (isExample(27))
            require('./Patterns/LinkingModules/PureTemplates/di_container/app');

        // 28. Локатор служб.
        if (isExample(28))
            require('./Patterns/LinkingModules/PureTemplates/service_locator/app');

        // 29. Локатор служб Express.
        if (isExample(29))
            require('./Patterns/LinkingModules/PureTemplates/service_locator_express/app');

        // 30. Плагин: доступ к службам через жесткие зависимости.
        if (isExample(30))
            require('./Patterns/LinkingModules/PluginTemplates/hard_coded_dependency/app');

        // 31. Плагин: инверсия зависимостей.
        if (isExample(31))
            require('./Patterns/LinkingModules/PluginTemplates/dependency_injection/app');

        // 32. Плагин: DI-контейнер
        if (isExample(32))
            // error
            require('./Patterns/LinkingModules/PluginTemplates/di_container/app');

        // 33. Плагин: локатор служб.
        if (isExample(33))
            require('./Patterns/LinkingModules/PluginTemplates/service_locator/app');
    }

    // --------------- Асинхронная обработка модулей.
    if (isChapter(6)) {

        // 34. Асинхронная инициализаия модулей.
        if (isExample(34))
            require('./Patterns/AsynchronousPatternsAdditional/asyncInit');

        // 35. Группировка и кэширование асинхронных операций.
        if (isExample(35))
            require('./Patterns/AsynchronousPatternsAdditional/batchingCaching');

        // 36. Дочерние процессы.
        if (isExample(36))
            require('./Patterns/AsynchronousPatternsAdditional/cpuBound');
    }

    // --------------- Шаблоны масштабирования и организации архитектуры.
    if (isChapter(7)) {

        // 37. Масштабирование приложений.

        // 38. Клонирование и распределение нагрузки.
        //      38.3 Запуск в linux.
        const cloningLoadBalancing = require('./Patterns/OrganizationPatterns/cloningLoadBalancing');
        if (isExample(38.1)) cloningLoadBalancing(38.1);
        if (isExample(38.2)) cloningLoadBalancing(38.2);
        if (isExample(38.3)) cloningLoadBalancing(38.3);
        if (isExample(38.8)) cloningLoadBalancing(38.8);
        if (isExample(38.9)) cloningLoadBalancing(38.9);

        // 39. Декомпозиция сложных приложений.
    }

    // --------------- Шаблоны обмена сообщениями и интеграции.
    if (isChapter(8)) {

        // 40. Системы обмена сообщениями.
        //      ./Patterns/IntegrationPatterns/messagingSystems

        // 41. Шаблон "Публикация/подписка".
        const patternPublishSubscribe = require('./Patterns/IntegrationPatterns/patternPublishSubscribe');
        if (isExample(41.1)) patternPublishSubscribe(41.1)
        if (isExample(41.2)) patternPublishSubscribe(41.2)
        if (isExample(41.3)) patternPublishSubscribe(41.3)
        if (isExample(41.6)) patternPublishSubscribe(41.6)

        // 42. Шаблоны конвейеров и распределения заданий.
        const patternsPipeline = require('./Patterns/IntegrationPatterns/patternsPipeline');
        if (isExample(42.1)) patternsPipeline(42.1);
        if (isExample(42.2)) patternsPipeline(42.2);

        // 43. Шаблоны конвейеров и распределения заданий.
        const patternsRequestResponse = require('./Patterns/IntegrationPatterns/patternsRequestResponse');
        if (isExample(43.1)) patternsRequestResponse(43.1);
        if (isExample(43.2)) patternsRequestResponse(43.2);
    }
};