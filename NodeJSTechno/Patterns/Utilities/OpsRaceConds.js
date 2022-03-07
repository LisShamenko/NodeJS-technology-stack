// устранение состояния гонки 
module.exports = () => {

    // коллекция
    let map = new Map();

    // 
    function check(value, callback) {

        // проверка значения 
        if (map.has(value)) {

            // promise версия не передает callback
            if (callback) {
                process.nextTick(callback);
            }

            // 
            return true;
        }

        // 
        map.set(value, true);
        return false;
    }

    // 
    function clear() {
        map.clear();
    }

    // 
    return {
        check: check,
        clear: clear,
    };
}