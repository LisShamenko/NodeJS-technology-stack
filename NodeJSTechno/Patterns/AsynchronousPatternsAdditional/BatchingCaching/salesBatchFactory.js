"use strict";

module.exports = function (salesApp) {

    //
    const queues = {};

    // 
    return {

        // проксирование оригинального программного интерфейса totalSales, поведение 
        //      salesBatchFactory отличается от оригинальной totalSales тем, что она
        //      выполняет группировку вызовов с одинаковыми входными данными, экономя 
        //      время и ресурсы
        totalSales: (item, callback) => {

            // если существует очередь для заданного типа элемента, то в данный момент
            //      обрабатывается запрос для этого типа элемента, будет достаточно 
            //      добавить обратный вызов в существующую очередь и вернуть управление
            if (queues[item]) {
                console.log('Batching operation');
                return queues[item].push(callback);
            }

            // если очередь отсутствует, то создается новая очередь для заданного item, 
            //      в которую помещается функция обратного вызова, потом вызывается 
            //      оригинальный программный интерфейс totalSales
            queues[item] = [callback];
            salesApp.totalSales(item, (err, res) => {

                // когда оригинальная totalSales вернет управление, выполнятся все функции
                //      в очереди с передачей им результата операции
                const queue = queues[item];
                queues[item] = null;
                queue.forEach(cb => cb(err, res));
            });
        }
    };
};