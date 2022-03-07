"use strict";

// pify
//      https://www.npmjs.com/package/pify
const pify = require('pify');

// 
module.exports = function (salesApp) {

    // модуль pify позволяет применить объекты Promise к оригинальной функции 
    //      totalSales, после чего она будет возвращать объекты Promise
    salesApp = pify(salesApp);

    //
    const cache = {};
    let timer;

    // 
    return {
        totalSales: (item, callback) => {

            // проверка существования кэшированного объекта Promise для заданного типа
            //      элемента, если объект существует, то он возвращается вызывающему коду
            if (cache[item]) {
                return cache[item];
            }

            // если объект в кэше отсутствует, то создается ссылка на оригинальную функцию 
            //      totalSales, возвращающую объекты Promise
            cache[item] = salesApp.totalSales(item)
                .then(res => {
                    // при разрешении Promise задается время очистки кэша и возвращается res
                    //      для передачи результата всем обработчикам then
                    timer = setTimeout(() => delete cache[item], 30000);
                    return res;
                })
                .catch(err => {
                    // если Promise отклоняется с ошибкой, кэш немедленно очищается и ошибка 
                    //      возбуждается вновь, чтобы передать ее по цепочке объектов Promise 
                    //      всем подключенным обработчикам
                    delete cache[item];
                    throw err;
                });

            // возвращается вновь созданный кэшированный объект Promise
            return cache[item];
        },

        close: () => {
            clearTimeout(timer);
        }
    };
};