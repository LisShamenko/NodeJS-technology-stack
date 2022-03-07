"use strict";

const request = require('request');
const process_argv_url = 'http://google.com';



// --------------- 9. Использование async/await.

// функция выполняющая promise-операцию
function getPageHtml(url) {
    return new Promise((resolve, reject) => {

        // 
        request(url, (err, response, body) => {
            if (err) {
                console.log(`--- err: ${err}`);
                return reject(err);
            }

            // 
            console.log(`--- complete`);
            resolve(body);
        });
    });
}

// --- 9.1 Поток выполнения с async/await.

// 
function async_await() {

    console.log('--- --- --- async_await');

    // функция выполняет асинхронный код и позволяет ей использовать 
    //      ключевое слово await
    (async function main() {

        // Ключевое слово await ожидает разрешение объекта Promise, прежде чем
        //      перейти к следующему оператору. Выполнение main приостанавливается
        //      в ожидании завершения асинхронного кода без блокировки выполнения
        //      программы.

        console.log(`--- before request`);
        const html = await getPageHtml(process_argv_url);
        console.log(`--- after request --- ${html.slice(0, 100)} ... `);
    })();
}

// --- 9.2 Обработка generator через promises.

function async_generator() {

    console.log('--- --- --- async_generator');

    // запуск
    main('test');

    // 
    function main() {

        // 1. генератор содержит набор операций
        const requestGen = function* (args) {
            console.log(`--- args = ${args}`);
            let html = yield getPageHtml(process_argv_url);
            console.log(`--- after request --- ${html.slice(0, 100)} ... `);
        };

        // 2. возвращает функцию-итератор, которая разбивает генератор 
        //      на массив операций и последовательно выполняет эти операции
        var ref = generatorToPromises(requestGen);

        // 3. функция-итератор вызывается с аргументами переданными 
        //      в функцию main
        return ref.apply(this, arguments);
    }

    // 
    function generatorToPromises(fn) {

        // 
        return function () {

            // 4. генератор возвращает массив операций
            var genParts = fn.apply(this, arguments);

            // 
            return new Promise(function (resolve, reject) {

                // 5. рекурсивный обход массива операций
                function step(key, arg) {

                    // 
                    let result = { value: null };

                    // 5.1 выбрать следующую операцию и выполнить
                    try {
                        // генерирует ошибку, если строку 'genParts[key](arg)' 
                        //      разделиь на две:
                        // 
                        //      TypeError: Method [Generator].prototype.next called on incompatible receiver undefined
                        result = genParts[key](arg);
                        console.log(`--- step --- ${result} `);
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }

                    // 5.2 проверка результата операции
                    if (result.done) {
                        // 5.3 генератор выполнился, вернуть конечный результат
                        resolve(result.value);
                    }
                    else {
                        // 5.4 запустить следующий promise 
                        return Promise.resolve(result.value)
                            .then(
                                (result) => {
                                    // 5.5 передать промежуточный результат на следующий шаг 
                                    return step("next", result);
                                },
                                (err) => {
                                    // 5.6 передать ошибку дальше
                                    return step("throw", err);
                                }
                            );
                    }
                }

                // 5.0 запуск рекурсии
                return step("next");
            });
        };
    }
}

// --- Запуск.

async_await();
async_generator();