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
};