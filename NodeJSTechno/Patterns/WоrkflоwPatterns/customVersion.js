"use strict";

// библиотека для упорядочения HTTP­ вызовов
const request = require('request');
// небольшая утилита для рекурсивного создания каталогов
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

// 
const OpsURL = require('./../Utilities/OpsURL');
const { arrayTaskQueue } = require('./../Utilities/VarietyTaskQueues');

// чтобы запустить модуль с передачей параметров используйте следующую 
//      команду, запускать из корневого каталога, где есть файл package.json:
//      node index.js 'http://www.example.com'
//
//      console.log("--- process.argv[2] = " + process.argv[2]);
const process_argv_url = "http://www.example.com";
const basePath51 = 'NodeJSTechno/Patterns/dist/51';
const basePath52 = 'NodeJSTechno/Patterns/dist/52';
const basePath54 = 'NodeJSTechno/Patterns/dist/54';
const basePath55 = 'NodeJSTechno/Patterns/dist/55';
const basePath56 = 'NodeJSTechno/Patterns/dist/56';



// --------------- 5. Кастомные реализации паттернов управления.

// --- 5.1 Ад обратных вызовов.

// Ад обратных вызовов - нечитабельный код собранный из обратных вызовов и 
//      замыканий. Такой код является одним из самых трудных в исправлении 
//      антишаблонов NodeJS/JavaScript. Большое количество уровней ухудшает 
//      читабельность, сложно отследить, где заканчивается одна функция и 
//      начинается другая. Использование одноименных переменных (err) вносит 
//      путаницу и увеличивают вероятность ошибок. Замыкания отрицательно 
//      влияют на производительность и потребление памяти.

// Антишаблон:
//      asyncFoo(err => {
//          asyncBar(err => {
//              asyncFooBar(err => {
//                  // код принимает форму пирамиды из ­за глубокой вложенности, 
//                  //      неофициально такой код называют "обреченной пирамидой"
//              });
//          });
//      });

// создание простого поискового робота
function web_spider_callbacks() {

    console.log('--- --- --- web_spider_callbacks');

    // запуск
    webSpider(process_argv_url, (err, filename, isLoad) => {
        if (err) {
            console.log(`--- err: ${err}`);
        }
        else {
            console.log(`--- загружен: ${isLoad} --- filename: ${filename}`);
        }
    });

    // 
    function webSpider(url, callback) {

        // 
        const filename = OpsURL.getNameByURL(url, basePath51);

        // 0. определяет наличие файла, если файл существует, то URL уже обработан
        fs.exists(filename, exists => {
            if (!exists) {
                console.log(`--- ${url}`);

                // 1. если файл не найден, выполняется загрузка содержимого URL
                //      выделяется в download
                request(url, (err, response, body) => {
                    if (err) {
                        callback(err);
                    }
                    else {

                        // 2. создается каталог, куда будет помещен файл
                        //      выделяется в saveFile
                        mkdirp(path.dirname(filename), err => {
                            if (err) {
                                callback(err);
                            }
                            else {

                                // 3. тело HTTP ­ответа записывается в локальный файл
                                fs.writeFile(filename, body, err => {
                                    if (err) {
                                        callback(err);
                                    }
                                    else {

                                        // 4. завершающее действие
                                        callback(null, filename, true);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                callback(null, filename, false);
            }
        });
    }

}

// --- 5.2 Рекомендации по использованию обратных вызовов.

// - при разработке асинхронного кода нельзя злоупотреблять замыканиями при определении 
//      обратных вызовов;
// - следует использовать операторы [return, continue, break] для быстрого выхода из 
//      блока кода и избегать сложных операторов if/else, что помогает избавится от 
//      глубокой вложенности кода;
// - именованные функции обратного вызова позволяют избегать замыканий, при этом
//      промежуточные результаты передаются в аргументах, так же они отображаются в 
//      трассировке стека;
// - следует повышать модульность кода, разбивая код на небольшие функции, пригодные
//      к многократному использованию.

// Пример упрощения блока if/else
function simplufy_if_else(err = false, callback = f => f) {

    console.log('--- --- --- simplufy_if_else');

    // более сложный код:
    if (err) {
        callback(err);
    }
    else {
        // код, выполняемый в отсутствие ошибок
    }

    // упрощённый код:
    if (err) {
        // возвращаемый callback-функцией результат передается асинхронно методу
        //      обратного вызова, где обычно он игнорируется
        return callback(err);
    }

    // код, выполняемый в отсутствие ошибок
}

// Пример выделения именованных функций
function extraction_named_functions() {

    console.log('--- --- --- extraction_named_functions');

    // запуск
    webSpider(process_argv_url, (err, filename, isLoad) => {
        if (err) {
            console.log(`--- err: ${err}`);
        }
        else {
            console.log(`--- загружен: ${isLoad} --- filename: ${filename}`);
        }
    });

    // изменилась организация кода, применение принципов позволило уменьшить 
    //      уровень вложенности кода и увеличить модульность
    function webSpider(url, callback) {

        // 
        const filename = OpsURL.getNameByURL(url, basePath52);

        // 0. проверка имени
        fs.exists(filename, exists => {
            if (exists) {
                return callback(null, filename, false);
            }

            // ступенчатый код инкапсулируется в именованные функции
            download(url, filename, err => {
                if (err) {
                    return callback(err);
                }

                // 4. завершающее действие
                callback(null, filename, true);
            })
        });
    }
}

// загрузка URL и сохранение в файле
function download(url, filename, callback) {
    console.log(`--- download start --- URL: ${url}`);

    // 1. запрос
    request(url, (err, response, body) => {
        if (err) {
            console.log(`--- download error --- URL: ${url}`);
            return callback(err);
        }

        // запись файла
        saveFile(filename, body, err => {
            if (err) {
                console.log(`--- download error --- URL: ${url}`);
                return callback(err);
            }

            // 
            console.log(`--- download complete --- URL: ${url}`);
            callback(null, body);
        });
    });
}

// функция сохранения в файле
function saveFile(filename, content, callback) {

    // 
    let filepath = path.dirname(filename);

    // 2. проверка пути
    mkdirp(filepath, err => {
        if (err) {
            return callback(err);
        }

        // 3. запись файла
        fs.writeFile(filename, content, callback);
    });
}

// --- 5.3 Шаблон 'Последовательное выполнение'.

// Шаблон 'Последовательное выполнение' - это выполнение заданий по одному в заданном 
//      порядке, так что результат предыдущего задания может повлиять на выполнение 
//      следующего. 

// - выполнение набора известных заданий, без цепочек и передачи результатов;
// - выполнение цепочки заданий, где результат предыдущего задания передается 
//      на вход следующего;
// - последовательный обход коллекции и выполнение асинхронного задания для каждого
//      элемента.

function sequential_callbacks() {

    console.log('--- --- --- sequential_callbacks');

    // асинхронная операция, откладывает выполнения до следующей итерации
    //      цикла событий
    function asyncOperation(callback) {
        console.log('--- wait next tick');
        process.nextTick(callback);
    }

    function firstTask(callback) {
        console.log('--- firstTask');
        asyncOperation(() => secondTask(callback));
    }

    function secondTask(callback) {
        console.log('--- secondTask');
        asyncOperation(() => thirdTask(callback));
    }

    function thirdTask(callback) {
        console.log('--- thirdTask');
        // обратный вызов в завершающем задании
        asyncOperation(() => callback());
    }

    // запуск цепочки заданий
    firstTask(() => console.log('--- завершение цепочки заданий'));
}

// --- 5.4 Шаблон 'Последовательный итератор'.

// Шаблон 'Последовательный итератор' - последовательно выполняет задания из списка 
//      через функцию iterator, которая вызывает следующее доступное задание в коллекции 
//      и гарантирует выполнение следующего шага итерации после завершения текущего 
//      задания.

// универсальный шаблон
function sequential_iterator_template() {

    console.log('--- --- --- sequential_iterator_template');

    // если task является синхронной операцией, то алгоритм становится рекурсивным, 
    //      тогда стек вызовов не будет обновляться и возникает риск его переполнения 

    // функция итерации
    function iterate(tasks, index) {

        console.log(`--- s-iterator --- iterate: ${index}`);

        // условие завершения итератора
        if (index === tasks.length) {
            return finish();
        }

        // выбрать следующее задание
        const task = tasks[index];

        // выполнить задание и после его завершения перейти 
        //      к следующей итерации
        task(index, () => iterate(tasks, index + 1));
    }

    // завершение
    function finish() {
        console.log('--- s-iterator --- finish');
    }

    // задание
    let mainTask = (index, callback) => {
        console.log(`--- s-iterator --- синхронная операция: ${index}`);
        callback();
    }

    // запуск
    iterate([mainTask, mainTask, mainTask], 0);
}

// 
function sequential_iterator_example() {

    console.log('--- --- --- sequential_iterator_example');

    // 
    webSpider(process_argv_url, 1, (err) => {
        if (err) {
            console.log(`--- error: ${err}`);
            process.exit();
        }
        else {
            console.log('--- complete');
        }
    });

    // 
    function webSpider(url, nesting, callback) {

        // 
        const filename = OpsURL.getNameByURL(url, basePath54);
        fs.readFile(filename, 'utf8', function (err, body) {
            if (err) {

                // 
                if (err.code !== 'ENOENT') {
                    console.error(`--- file '${filename}' does not exist`);
                    return callback(err);
                }

                // 
                return download(url, filename, function (err, body) {
                    if (err) {
                        return callback(err);
                    }

                    // 
                    spiderLinks(url, body, nesting, callback);
                });
            }

            // 
            spiderLinks(url, body, nesting, callback);
        });
    }

    // извлекает все ссылки на странице и последовательно обрабатывает каждую ссылку
    function spiderLinks(currentUrl, body, nesting, callback) {
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        // получение списка всех внутренних ссылок на странице
        const links = OpsURL.getLinksFromBody(currentUrl, body);

        // перебор ссылок, где index - индекс следующей анализируемой ссылки
        function iterate(index) {
            // проверяет равенство индекса и длины массива ссылок, если true 
            //      то все элементы обработаны и вызывается callback()
            if (index === links.length) {
                return callback();
            }

            // выполянем обработку ссылки, уменьшая вложенность
            webSpider(links[index], nesting - 1, err => {
                if (err) {
                    return callback(err);
                }

                // следующая итерация выполняется после завершения обработки ссылки
                iterate(index + 1);
            });
        }

        // запуск обработки
        iterate(0);
    }
}

// --- 5.5 Шаблон 'Неограниченного параллельного выполнения'.

// Шаблон 'Неограниченного параллельного выполнения' - параллельный запуск набора 
//      асинхронных заданий с последующим ожиданием их завершения путем подсчёта 
//      количества обратных вызовов, выполненных ими.

// Параллельная обработка в Node.js не означает одновременное выполнение заданий,  
//      в действительности они чередуются с выполнением цикла событий, не блокируя
//      приложение.

// Конкуретное выполнение - задание возвращает управление циклу событий, когда 
//      запрашивает новую асинхронную операцию, позволяя циклу событий выполнить 
//      другие задания. Параллельно можно выполнять только асинхронные операции, 
//      так как они не блокируют приложение. Синхронные операции не могут выполняться 
//      параллельно, если их выполнение не чередуется с асинхронными или не откладывается 
//      с помощью функции setTimeout() или setImmediate().

// универсальный шаблон
function parallel_no_limitied_template() {

    console.log('--- --- --- parallel_no_limitied_template');

    // задание
    let mainTask = (index, callback) => {
        console.log(`--- parallel-no-limitied --- асинхронная операция: ${index}`);
        process.nextTick(callback);
    }

    // завершение
    function finish() {
        console.log('--- parallel-no-limitied --- finish');
    }

    // счётчик завершённых заданий
    let completed = 0;
    let counter = 0;

    // 
    const tasks = [mainTask, mainTask, mainTask, mainTask, mainTask];

    // 
    tasks.forEach(task => {
        task(++counter, () => {
            // здесь можно организовать накопление результатов заданий, вызывать 
            //      функцию finish при завершении заданного количества заданий
            //      (конкурентная гонка)
            if (++completed === tasks.length) {
                finish();
            }
        });
    });
}

//
function parallel_no_limitied_example() {

    console.log('--- --- --- parallel_no_limitied_example');

    // --- --- Устранение состояния гонки в параллельных заданиях.

    // Состояние гонки может приводить к трудноотслеживаемым ошибкам, поэтому следует 
    //      всегда проверять код на возможность возникновени таких состояний. 

    // запоминание обработанных URL 
    let spidering = new Map();

    // 
    function checkSpidering(url, callback) {

        // достаточно завести переменную, позволяющую исключить обработку одного и 
        //      того же URL несколькими заданиями спайдера
        if (spidering.has(url)) {
            process.nextTick(callback);
            return true;
        }

        // новый url
        spidering.set(url, true);
        return false;
    }

    // --- --- запуск

    webSpider(process_argv_url, 1, (err) => {
        if (err) {
            console.log(`--- error: ${err}`);
            process.exit();
        }
        else {
            console.log('--- complete');
        }
    });

    // два задания могут обращаться к одному и тому же файлу по одному URL, прежде чем 
    //      одно из них успеет завершить загрузку и создать этот файл, в результате оба 
    //      задания начнут загрузку
    function webSpider(url, nesting, callback) {

        // устранение состояния гонки 
        if (checkSpidering(url, callback)) {
            return true;
        }

        // 
        const filename = OpsURL.getNameByURL(url, basePath55);
        fs.readFile(filename, 'utf8', function (err, body) {
            if (err) {

                // 
                if (err.code !== 'ENOENT') {
                    console.error(`--- file '${filename}' does not exist`);
                    return callback(err);
                }

                // 
                return download(url, filename, function (err, body) {
                    if (err) {
                        return callback(err);
                    }

                    // 
                    spiderLinks(url, body, nesting, callback);
                });
            }

            // 
            spiderLinks(url, body, nesting, callback);
        });
    }

    // --- --- Шаблон 'Неограниченного параллельного выполнения'.

    function spiderLinks(currentUrl, body, nesting, callback) {
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        const links = OpsURL.getLinksFromBody(currentUrl, body);
        if (links.length === 0) {
            return process.nextTick(callback);
        }

        // функция подсчитывает количество завершённых заданий
        let completed = 0, hasErrors = false;
        function done(err) {
            if (err) {
                hasErrors = true;
                return callback(err);
            }

            // количество завершенных загрузок равно длине массива ссылок
            if (++completed === links.length && !hasErrors) {
                return callback();
            }
        }

        // все задания запускаются одновременно
        links.forEach(link => webSpider(link, nesting - 1, done));
    }
}

// --- 5.6 Ограниченное параллельное выполнение.

// При неограниченном параллельном выполнении происходит интенсивное использование 
//      ресурсов, например, задействование всех доступных дескрипторов файлов, что 
//      может вызвать уязвимость отказ в обслуживании (Denial of Service, DoS). 
//      Следует ограничивать число одновременно выполняющихся заданий. При старте 
//      количество запускаемых заданий не превышает заданный предел. Завершение 
//      задания приводит к запуску новых заданий до достижения предела.

// Количество одновременных HTTP подключений к одному хосту:
//      http://nodejs.org/docs/v0.10.0/api/http.html#http_agent_maxsockets

// универсальный шаблон
function parallel_limitied_template() {

    console.log('--- --- --- parallel_limitied_template');

    // задание
    let mainTask = (index, callback) => {
        console.log(`--- parallel-limitied --- асинхронная операция: ${index}`);
        process.nextTick(callback);
    }

    // завершение
    function finish() {
        console.log('--- parallel-limitied --- finish');
    }

    //
    const tasks = [mainTask, mainTask, mainTask, mainTask, mainTask];
    let concurrency = 2, running = 0, completed = 0, index = 0;

    // функция ­итератор next содержит цикл, обеспечивающий параллельный запуск 
    //      ограниченного числа заданий
    function next() {
        while (running < concurrency && index < tasks.length) {
            let task = tasks[index++];

            // функция обратного вызова содержит условие завершение обработки и
            //      вызов next для запуска следующей партии заданий
            task((index - 1), () => {
                if (completed === tasks.length) {
                    return finish();
                }

                // подсчёт завершённых и выполняемых задач
                completed++;
                running--;
                next();
            });

            // 
            running++;
        }
    }

    // первый запуск next, первая партия заданий
    next();
}

// 
function parallel_limitied_example() {

    // устранение состояния гонки 
    let spidering = new Map();
    function checkSpidering(url, callback) {
        if (spidering.has(url)) {
            process.nextTick(callback);
            return true;
        }
        spidering.set(url, true);
        return false;
    }

    //
    const downloadQueue = new arrayTaskQueue(2);

    // запуск
    webSpider(process_argv_url, 1, (err) => {
        if (err) {
            console.log(`--- error: ${err}`);
            process.exit();
        }
        else {
            console.log('--- complete');
        }
    });

    // 
    function webSpider(url, nesting, callback) {

        // устранение состояния гонки 
        if (checkSpidering(url, callback)) {
            return true;
        }

        // 
        const filename = OpsURL.getNameByURL(url, basePath56);
        fs.readFile(filename, 'utf8', function (err, body) {
            if (err) {

                // 
                if (err.code !== 'ENOENT') {
                    console.error(`--- file '${filename}' does not exist`);
                    return callback(err);
                }

                // 
                return download(url, filename, function (err, body) {
                    if (err) {
                        return callback(err);
                    }

                    // 
                    spiderLinks(url, body, nesting, callback);
                });
            }

            // 
            spiderLinks(url, body, nesting, callback);
        });
    }

    //
    function spiderLinks(currentUrl, body, nesting, callback) {
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        //
        const links = OpsURL.getLinksFromBody(currentUrl, body);
        if (links.length === 0) {
            return process.nextTick(callback);
        }

        //
        let completed = 0, hasErrors = false;
        links.forEach(link => {

            // управление параллельным выполнением делегируется объекту TaskQueue, 
            //      остается только проверка на завершение всех заданий
            downloadQueue.pushTask(done => {

                // передаем свою функцию обратного вызова
                webSpider(link, nesting - 1, err => {
                    if (err) {
                        hasErrors = true;
                        return callback(err);
                    }

                    // функция обратного вызова проверяет завершение всех заданий и вызывает
                    //      завершающую функцию обратного вызова
                    if (++completed === links.length && !hasErrors) {
                        callback();
                    }

                    // функция done() гарантирует запуск следующих заданий из очереди
                    done();
                });
            });
        });
    }
}

// --- Запуск.

web_spider_callbacks();
simplufy_if_else();
extraction_named_functions();
sequential_callbacks();
sequential_iterator_template();
sequential_iterator_example();
parallel_no_limitied_template();
parallel_no_limitied_example();
parallel_limitied_template();
parallel_limitied_example();