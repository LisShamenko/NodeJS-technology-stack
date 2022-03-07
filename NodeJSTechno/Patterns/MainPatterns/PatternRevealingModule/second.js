module.exports = {
    login: () => "second",
    toString: () => {
        return "--- second module ---";
    },
};

// циклические зависимости
exports.loaded = false;
const first = require('./PatternRevealingModule/first.js');
module.exports.firstWasLoaded = first.loaded;
module.exports.loaded = true;