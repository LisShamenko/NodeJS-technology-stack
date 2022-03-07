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
};