"use strict";

// 
module.exports = function (salesDb) {

    // создание БД
    //      const DB = level(pathDB, { valueEncoding: 'json' });
    //      const subDB = sublevel(DB);
    //      const salesDb = subDB.sublevel('sales');

    // Возможные варианты оптимизации: индексация по типу item, пошаговое 
    //      отображение/свертка (map/reduce) для вычисления суммы в режиме 
    //      реального времени.

    return {
        totalSales: (item, callback) => {
            let sum = 0;

            // создается поток данных из подуровня salesDb, в поток включаются 
            //      все записи соответствующего вида из базы
            salesDb.createValueStream()
                // событие data возникает при извлечении каждой записи из базы
                .on('data', data => {
                    if (!item || data.item === item) {
                        sum += data.value;
                    }
                })
                .on('end', () => {
                    // по событию end вызывается метод callback, которому 
                    //      передается итоговая сумма
                    callback(null, sum);
                });
        }
    };
}