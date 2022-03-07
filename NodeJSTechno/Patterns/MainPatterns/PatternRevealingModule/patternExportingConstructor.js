
// --- Шаблон: экспорт конструктора.

function Logger(name) {

    // модуль используется, как фабрика
    if (!(this instanceof Logger)) {
        // ссылка на this должна существовать и являться экземпляром Logger, 
        //      если это ни так, то функция была вызвана без ключевого слова new
        return new Logger(name);
    }

    // new.target – это метасвойство, доступное внутри любой функции, оно принимает
    //      значение true, если функция вызвана с помощью ключевого слова new
    if (!new.target) {
        return new Logger(name);
    }

    // модуль используется для создания экземпляра при помощи new
    this.name = name;
};

Logger.prototype.log = function (message) {
    console.log(`[${this.name}] ${message}`);
};

Logger.prototype.info = function (message) {
    this.log(`info: ${message}`);
};

Logger.prototype.verbose = function (message) {
    this.log(`verbose: ${message}`);
};

module.exports = Logger;

// ES2015:
class Logger2015 {
    constructor(name) {
        this.name = name;
    }
    log(message) {
        console.log(`[${this.name}] ${message}`);
    }
    info(message) {
        this.log(`info: ${message}`);
    }
    verbose(message) {
        this.log(`verbose: ${message}`);
    }
}
module.exports.Logger2015 = Logger2015;