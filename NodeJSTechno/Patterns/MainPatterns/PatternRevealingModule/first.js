// все компоненты модуля являются закрытыми, если не присвоены переменной module.exports,
//      содержимое которой кэшируется и возвращается при загрузке модуля с помощью require
function privateLog() {
    console.log(`Well done ${second.login}`);
}

// экспортируемый общедоступный интерфейс
module.exports = {
    login: () => "first",
    toString: () => {
        return "--- first module ---";
    },
    publicLog: () => privateLog(),
};

// циклические зависимости
exports.loaded = false;
const second = require('./PatternRevealingModule/second.js');
module.exports.secondWasLoaded = second.loaded;
module.exports.loaded = true;