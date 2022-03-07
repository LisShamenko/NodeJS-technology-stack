"use strict";

// --- 7.2 Механизм отложенных вычислений.

// 
function promisify(callbackBasedApi) {
    return function promisified() {

        // сохранить аргументы функции 
        let args = [].slice.call(arguments);

        // функция создает и возвращет новый объект Promise
        return new Promise((resolve, reject) => {

            // функция обратного вызова всегда передается в последнем аргументе,
            //      поэтому она добавляется в список аргументов (args) функции 
            //      promisified
            args.push((err, result) => {

                // если функция обратного вызова получит ошибку, 
                //      то объект Promise отклоняется
                if (err) {
                    return reject(err);
                }

                // разрешение объекта Promise, в который передается результат
                //      в зависимости от количества переданных значений
                if (arguments.length <= 2) {
                    // результат одно значение
                    resolve(result);
                }
                else {
                    // результат это массив значений, исключая последний элемент
                    resolve([].slice.call(arguments, 1));
                }
            });

            // вызывается callbackBasedApi с созданным списком аргументов
            callbackBasedApi.apply(null, args);
        });
    }
};

// 
module.exports.promisify = promisify;