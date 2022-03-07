"use strict";

const path = require('path');
const fs = require('fs');
const request = require('request');
const mkdirp = require('mkdirp');

// 
const { promiseTaskQueue } = require('./../Utilities/VarietyTaskQueues');
const OpsURL = require('./../Utilities/OpsURL');
const OpsPormise = require('./../Utilities/OpsPormise');
const OpsRaceConds = require('./../Utilities/OpsRaceConds');

// 
const process_argv_url = "http://www.example.com";
const basePath74 = 'NodeJSTechno/Patterns/dist/74';
const basePath75 = 'NodeJSTechno/Patterns/dist/75';
const basePath76 = 'NodeJSTechno/Patterns/dist/76';



// --------------- 7. Promises.

// Объект Promise представляет конечный результат асинхронной операции. Объект Promise 
//      ожидает, если асинхронная операция еще не завершилась, выполнен – если операция 
//      завершилась успешно, отклонен – если возникла ошибка и считается установившимся
//      после того как будет выполнен или отклонен. Promise переводится как 'обещание',
//      то есть 'обещает' выполнить асинхронную операцию в будущем.

function callback_and_promise() {

    console.log('--- --- --- callback_and_promise');

    // 
    function asyncOperation(time, result, callback) {
        if (callback) {
            setTimeout(() => callback(null, result), time);
        }
        else {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(result), time);
            });
        }
    }

    // асинхронная операция с обратным вызовом
    asyncOperation(250, 'first result', (err, result) => {
        if (err) {
            // обработка ошибки
            return console.log(`--- err = ${err}`);
        }
        // работа с результатом
        console.log(`--- result = ${result}`);
    });

    // асинхронная операция Promise
    asyncOperation(500, 'second result')
        // метод then позволяет получить результат операции
        .then(
            // onFulfilled
            result => console.log(`--- result = ${result}`),
            // onRejected
            err => console.log(`--- err = ${err}`)
        );

    // сигнатура then:
    //      promise.then([onFulfilled], [onRejected])
    // аргументы:
    //      onFulfilled - в эту функцию передается результат выполнения 
    //          асинхронной операции;
    //      onRejected - в эту функцию передается причина отклонения.

    // Метод then возвращет другой объект Promise, что позволяет создавать цепочки 
    //      из вызовов then. Если в then не указан onFulfilled или onRejected, то 
    //      будет выполнен следующий в цепочке соответствующий обработчик onFulfilled 
    //      или onRejected.

    // Если результат onFulfilled/onRejected это X, то then вернет объект Promise:
    //      - выполненный со значением X, если X это значение;
    //      - выполненный с объектом X, где X это объект Promise или thenable-объект;
    //      - отклоненный по причине X, где X это объект Promise или thenable-объект.

    // thenable-объект - это объект с методом then, но реализация такого объекта 
    //      отличается от Promise.

    // Функции onFulfilled и onRejected вызываются асинхронно даже при синхронном 
    //      выполнении, например, если onFulfilled возвращает значение 'done'. Это 
    //      исключает вызов Залго.

    // Если обработчики onFulfilled или onRejected возбуждают исключение оператором 
    //      throw, то then возвратит объект Promise, который будет автоматически 
    //      отклонен с исключением в качестве причины отказа. Исключение будет 
    //      передаваться по цепочки и не будет передано в цикл событий. Оно может 
    //      быть обработано в последнем обработчике, куда сходятся все неизвестные 
    //      ошибки.

    // цепочка вызовов then
    asyncOperation(750, 'third result')
        .then(result => {
            // возвращает другой объект Promise
            return asyncOperation(1000, result + ' - fourth result');
        })
        .then(result => {
            // возвращает значение
            return result + ' - done';
        })
        .then(result => console.log('--- ' + result))
        .then(undefined, err => {
            // здесь обрабатываются все возникшие в цепочке ошибки
        });
}

// --- 7.1 Спецификация Promises/A+.

// Спецификация Promises/A+ определяет поведение then и Promise, но не описывает другие 
//      функции, например, создание Promise на основе асинхронной функции с обратным 
//      вызовом.
//      https://promisesaplus.com

// --- --- Конструктор Promise.

// Конструктор создает Promise, который разрешается или отклоняется функцией,
//      передаваемой в конструктор.
// 
// ... = new Promise(function(resolve, reject) {})
//
//      resolve(obj) - разрешает Promise: если obj это другой объект Promise или 
//          thenable­-объект, то возвращает результат выполнения этого объекта; 
//          если obj это значение, то возвращает значение.
//
//      reject(err) - отклоняет объект Promise с объектом ошибки err, который должен
//          быть экземпляром Error.

// --- --- Статические методы объекта Promise.

// - Promise.resolve(obj)
//      возвращает новый объект Promise, созданный из obj, который может быть
//          thenable-объектом или значением.

// - Promise.all(iterable)
//      создает объект Promise, который разрешается если все элементы итератора 
//          выполнились и отклоняется при первом отклонении любого элемента итератора, 
//          элементом может быть объект Promise, thenable-­объект или значение.

// - Promise.race(iterable)
//      возвращает объект Promise, который будет разрешен или отклонен по результату
//          выполнения первого элемента итератора.

// --- --- Методы экземпляра Promise.

// - promise.then(onFulfilled, onRejected)
//      основной метод объекта Promise.

// - promise.catch(onRejected)
//      удобная синтаксическая конструкция, заменяющая promise.then(undefined, onRejected).

// Функции onFulfilled и onRejected должны вызываться только один раз и не обе сразу. 
//      Совместимая реализация объектов Promise должна гарантировать, что даже при 
//      многократном разрешении или отклонении объект Promise изменит свое состояние 
//      только один раз.

// Пакеты реализующие спецификацию:
//      - Bluebird          https://npmjs.org/package/bluebird
//      - Q                 https://npmjs.org/package/q
//      - RSVP              https://npmjs.org/package/rsvp
//      - Vow               https://npmjs.org/package/vow
//      - When.js           https://npmjs.org/package/when
//      - Promise ES2015

// --- 7.2 Механизм отложенных вычислений.

// Не является частью стандарта ES2015:
//      Q           https://github.com/kriskowal/q#using-deferreds
//      When.js     https://github.com/cujojs/when/wiki/Deferred

// Преобразование обычной функции в функцию возвращающую объект Promise, аналогичные
//      функции в известных пакетах:
//      - Q            Q.denodeify и Q.nbind
//      - Bluebird     Promise.promisify
//      - When.js      node.lift

// 
const requestPromise = OpsPormise.promisify(request);
const mkdirpPromise = OpsPormise.promisify(mkdirp);

// --- 7.3 Код для promise шаблонов.

// 
function execute_with_promise(spiderLinks, basePath) {

    // устранение состояния гонки 
    let raceConds = OpsRaceConds();

    // преобразование обычных функций в функции возвращающие Promise
    const readFilePromise = OpsPormise.promisify(fs.readFile);
    const writeFilePromise = OpsPormise.promisify(fs.writeFile);

    // запуск
    webSpider(process_argv_url, 1)
        .then(() => console.log(`--- complete`))
        .catch(err => console.log(err));

    //
    function webSpider(url, nesting) {

        // устранение состояния гонки 
        if (raceConds.check(url)) {
            return Promise.resolve();
        }

        // 
        const filename = OpsURL.getNameByURL(url, basePath);
        return readFilePromise(filename, 'utf8')
            .then(
                body => {
                    console.log(`--- readFilePromise`);
                    return spiderLinks(webSpider, url, body, nesting);
                },
                err => {

                    // 
                    if (err.code !== 'ENOENT') {
                        console.error(`--- file '${filename}' does not exist`);
                        throw err;
                    }

                    // 
                    return download(url, filename)
                        .then(body => {
                            console.log(`--- downloadPromise`);
                            return spiderLinks(webSpider, url, body, nesting);
                        });
                }
            );
    }

    // использовать promise-версии функций
    function download(url, filename) {
        console.log(`--- download start: ${url}`);

        // 
        let body;
        return requestPromise(url)
            .then(response => {
                body = response.body;
                console.log(`--- request complete --- body: ${body}`);

                // 
                let pathname = path.dirname(filename);
                return mkdirpPromise(pathname);
            })
            .then(() => {
                console.log(`--- mkdir complete`);
                return writeFilePromise(filename, body);
            })
            .then(() => {
                console.log(`--- download complete: ${url}`);
                return body;
            });
    }
}

// --- 7.4 Последовательное выполнение.

// Шаблон последовательные итерации Promise - этот шаблон динамически строит цепочку 
//      объектов Promise в цикле.

// универсальный шаблон
function promises_sequential_execution_template() {

    // 
    let tasks = [/* ... */];

    // 
    let promise = Promise.resolve();
    tasks.forEach(task => {
        promise = promise.then(() => {
            return task();
        });
    });

    // функция reduce позволяет сократить код
    promise = tasks.reduce((prev, task) => {
        return prev.then(() => {
            return task();
        });
    }, Promise.resolve());

    // все задания выполнены
    promise.then(() => { });
}

// 
function promises_sequential_execution_example() {

    console.log('--- --- --- promises_sequential_execution_example');

    // 
    function spiderLinks(webSpider, currentUrl, body, nesting) {

        // создание пустого объекта Promise, разрешаемого как undefined
        //      это начало цепочки
        let promise = Promise.resolve();
        if (nesting === 0) {
            return promise;
        }

        // в цикле присваивается новый объект Promise, полученный от предыдущего 
        //      Promise в цепочки через метод then
        const links = OpsURL.getLinksFromBody(currentUrl, body);
        links.forEach(link => {
            promise = promise.then(() => webSpider(link, nesting - 1));
        });

        return promise;
    }

    // 
    execute_with_promise(spiderLinks, basePath74);
}

// --- 7.5 Параллельное выполнение.

function promises_parallel_execution_example() {

    console.log('--- --- --- promises_parallel_execution_example');

    // 
    function spiderLinks(webSpider, currentUrl, body, nesting) {
        if (nesting === 0) {
            return Promise.resolve();
        }

        const links = OpsURL.getLinksFromBody(currentUrl, body);

        // запуск всех заданий одновременно, все Promise помещаются в массив
        const promises = links.map(link => webSpider(link, nesting - 1));

        // Promise.all возвращает новый объект Promise, который перейдет в установившееся 
        //      состояние после выполнения всех объектов Promise из массива
        return Promise.all(promises);
    }

    // 
    execute_with_promise(spiderLinks, basePath75);
}

// --- 7.6 Ограниченное параллельное выполнение.

function promises_limited_parallel_execution() {

    console.log('--- --- --- promises_limited_parallel_execution');

    const downloadQueue = new promiseTaskQueue(2);

    //
    function spiderLinks(webSpider, currentUrl, body, nesting) {
        if (nesting === 0) {
            return Promise.resolve();
        }

        // 
        const links = OpsURL.getLinksFromBody(currentUrl, body);

        // проверка необходима, так как Promise никогда не установится
        //      при отсутствии заданий, а задания создаются для ссылок
        if (links.length === 0) {
            return Promise.resolve();
        }

        // вернуть новый Promise, чтобы разрешить его после завершения всех 
        //      заданий в очереди
        return new Promise((resolve, reject) => {
            let completed = 0;
            let errored = false;
            links.forEach(link => {
                let task = () => {
                    return webSpider(link, nesting - 1)
                        // к возвращаемому Promise подключается обработчик onFulfilled
                        .then(() => {
                            // если количество завершенных заданий равно числу ссылок, то
                            //      обработка завершается и вызывается resolve внешнего Promise
                            if (++completed === links.length) {
                                resolve();
                            }
                        })
                        .catch(() => {
                            if (!errored) {
                                errored = true;
                                reject();
                            }
                        });
                };
                downloadQueue.pushTask(task);
            });
        });
    }

    // 
    execute_with_promise(spiderLinks, basePath76);
}

// --- 7.7 Обратные вызовы и объекты Promise в общедоступных программных интерфейсах

// Чаще всего в библиотеках следуют одному из следующих методов.
//      - Реализуется простой программный интерфейс, основанный только на обратных вызовах.
//          Для перевода функций в Promise-совместимые библиотеки включают вспомогательные
//          функции, которые осуществляют такой перевод. Разработчик должен заранее 
//          подумать о выборе интерфейса и выполнить преобразование.
//      - Реализуется программный интерфейс в котором аргумент с функцией обратного вызова 
//          не обязателен. Если этот аргумент передается, то используется механизм обратного
//          вызова, иначе возвращается Promise. Этот подход дает возможность принимать 
//          выбор интерфейса во время вызова библиотечной функции. 

// 
function exposing_callback_and_promises() {

    console.log('--- --- --- exposing_callback_and_promises');

    // 
    function asyncDivision(dividend, divisor, cb) {

        // возвращается новый Promise
        return new Promise((resolve, reject) => {

            // выполнить на следующей итерации цикла событий
            process.nextTick(() => {
                const result = (dividend / divisor);

                // обработка ошибки
                if (isNaN(result) || !Number.isFinite(result)) {
                    const error = new Error('Invalid operands');

                    // функция обратного вызова возвращает ошибку
                    if (cb) {
                        cb(error);
                    }
                    // объект Promise отклоняется
                    return reject(error);
                }

                // функция обратного вызова возвращает результат
                if (cb) {
                    cb(null, result);
                }
                // объект Promise разрешается
                resolve(result);
            });

        });
    };

    // использование с обратным вызовом
    asyncDivision(10, 2, (error, result) => {
        if (error) {
            return console.error('--- используется функция обратного вызова --- error = ' + error);
        }
        console.log('--- используется функция обратного вызова --- result = ' + result);
    });

    // использование с объектом Promise
    asyncDivision(22, 11)
        .then(result => {
            console.log('--- используется Promise --- result = ' + result)
        })
        .catch(error => {
            console.error('--- используется Promise --- error = ' + error)
        });
}

// --- Запуск.

callback_and_promise();
promises_sequential_execution_example();
promises_parallel_execution_example();
promises_limited_parallel_execution();
exposing_callback_and_promises();