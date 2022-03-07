"use strict";

module.exports = function (salesApp) {

    //
    const queues = {};
    const cache = {};
    let timer;

    // 
    return {
        totalSales: (item, callback) => {

            // проверка наличия кэша, если он есть, немедленно вернуть кэшированное 
            //      значение вызовом функции callback, отложив ее выполнение с помощью 
            //      метода process.nextTick
            const cached = cache[item];
            if (cached) {
                console.log('Cache hit');
                return process.nextTick(callback.bind(null, null, cached));
            }

            //
            if (queues[item]) {
                console.log('Batching operation');
                return queues[item].push(callback);
            }

            // 
            queues[item] = [callback];
            salesApp.totalSales(item, (err, res) => {

                // выполнение продолжается в режиме группировки, если операция 
                //      завершается успехом, то ее результат сохраняется в кэше
                if (!err) {
                    cache[item] = res;

                    // очистка кэша каждые 30 секунд, простой и эффективный способ
                    timer = setTimeout(() => delete cache[item], 30000);
                }

                //
                const queue = queues[item];
                queues[item] = null;
                queue.forEach(cb => cb(err, res));
            });
        },

        close: () => {
            clearTimeout(timer);
        }
    };
};