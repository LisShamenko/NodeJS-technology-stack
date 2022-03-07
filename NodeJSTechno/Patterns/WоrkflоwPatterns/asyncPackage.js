"use strict";

const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const async = require('async');
const OpsURL = require('./../Utilities/OpsURL');

const process_argv_url = "http://www.example.com";
const basePath62 = 'NodeJSTechno/Patterns/dist/62';
const basePath63 = 'NodeJSTechno/Patterns/dist/63';
const basePath64 = 'NodeJSTechno/Patterns/dist/64';
const basePath65 = 'NodeJSTechno/Patterns/dist/65';

// --------------- 6. Библиотека Async.

//      https://npmjs.org/package/async

// Async следует соглашению NodeS об обратных вызовах и автоматически передает 
//      ошибку вверх по стеку. После передачи ошибки в функцию обратного вызова, 
//      оставшиеся задания пропускаются и сразу выполняется завершающая функция.

// --- 6.1 Функции.

//
function webSpiderCallback(err) {
    if (err) {
        console.log(`--- error: ${err}`);
        process.exit();
    }
    else {
        console.log('--- complete');
    }
}

//
function download(url, filename, callback) {
    request(url, (err, response, body) => {
        if (err) return callback(err);
        saveFile(filename, body, err => {
            if (err) return callback(err);
            callback(null, body);
        });
    });
}

//
function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), err => {
        if (err) return callback(err);
        fs.writeFile(filename, contents, callback);
    });
}

// 
function webSpiderMethod(url, basePath, nesting, downloadMethod, spiderLinks, callback) {
    const filename = OpsURL.getNameByURL(url, basePath);
    fs.readFile(filename, 'utf8', function (err, body) {
        if (err) {
            if (err.code !== 'ENOENT') return callback(err);
            return downloadMethod(url, filename, function (err, body) {
                if (err) return callback(err);
                spiderLinks(url, body, nesting, callback);
            });
        }
        spiderLinks(url, body, nesting, callback);
    });
}

// --- 6.2 Последовательное выполнение известного набора заданий.

// eachSeries, mapSeries, filterSeries, rejectSeries, reduce, reduceRight, detectSeries, 
//      concatSeries, series, whilst, doWhilst, until, doUntil, forever, waterfall, 
//      compose, seq, applyEachSeries, iterator, timesSeries

function async_sequential_execution() {

    console.log('--- --- --- async_sequential_execution');

    // 
    webSpiderMethod(process_argv_url, basePath62, 1,
        downloadSeries, spiderLinks, webSpiderCallback);

    // 
    function spiderLinks(currentUrl, body, nesting, callback) {

        // 
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        // 
        let links = OpsURL.getLinksFromBody(currentUrl, body);
        function iterate(index) {

            // 
            if (index === links.length) {
                return callback();
            }

            // 
            webSpiderMethod(links[index], basePath62, nesting - 1,
                downloadSeries, spiderLinks,
                (err) => {
                    if (err) return callback(err);
                    iterate(index + 1);
                }
            );
        }

        // 
        iterate(0);
    }

    //
    function downloadSeries(url, filename, callback) {
        let body;
        async.series(
            [
                // первое задание, реализует загрузку содержимого URL и сохраняет 
                //      тело ответа в переменной body через замыкание
                callback => {
                    request(url, (err, response, resBody) => {
                        if (err) return callback(err);
                        body = resBody;
                        callback();
                    });
                },

                // - второе задание, создает каталог для загруженных страниц
                // - частично примененная функция mkdirp(), связанная с путем 
                //      к каталогу:
                //      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#partially_applied_functions
                mkdirp.bind(null, path.dirname(filename)),

                // - третье задание, запись содержимого URL в файл
                // - частичное применение здесь не сработает, так как body доступна
                //      после завершения первого задания
                // - исползуется механизм автоматического управления ошибками async, 
                //      функция обратного вызова передается сразу в fs.writeFile()
                callback => {
                    fs.writeFile(filename, body, callback);
                }
            ],
            // после завершения всех заданий вызывается заключительная функция 
            //      обратного вызова
            (err) => {
                if (err) return callback(err);
                callback(null, body);
            }
        );
    }
}

// --- 6.3 Последовательный перебор.

function async_sequential_iteration() {

    console.log('--- --- --- async_sequential_iteration');

    webSpiderMethod(process_argv_url, basePath63, 1,
        download, spiderLinks, webSpiderCallback);

    //
    function spiderLinks(currentUrl, body, nesting, callback) {
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        let links = OpsURL.getLinksFromBody(currentUrl, body);
        if (links.length === 0) {
            return process.nextTick(callback);
        }

        async.eachSeries(
            links,
            (link, callback) => {
                webSpiderMethod(link, basePath63, nesting - 1,
                    download, spiderLinks, callback);
            },
            callback
        );
    }
}

// --- 6.4 Параллельное выполнение.

// each, map, filter, reject, detect, some, every, concat, parallel, applyEach, times

function async_parallel_execution() {

    console.log('--- --- --- async_parallel_execution');

    webSpiderMethod(process_argv_url, basePath64, 1,
        download, spiderLinks, webSpiderCallback);

    // 
    function spiderLinks(currentUrl, body, nesting, callback) {
        if (nesting === 0) {
            return process.nextTick(callback);
        }

        let links = OpsURL.getLinksFromBody(currentUrl, body);
        if (links.length === 0) {
            return process.nextTick(callback);
        }

        // параллельное выполнение заданий, код не привязан к конкретному потоку 
        //      выполнения, он содержит только логику приложения
        async.each(
            links,
            (link, callback) => {
                webSpiderMethod(link, basePath64, nesting - 1,
                    download, spiderLinks, callback);
            },
            callback
        );
    }
}

// --- 6.5 Ограниченное параллельное выполнение

// eachLimit(), mapLimit(), parallelLimit(), queue(), cargo()

function async_limited_parallel_execution() {

    console.log('--- --- --- async_limited_parallel_execution');

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
    webSpider(process_argv_url, 1, webSpiderCallback);

    // 
    function webSpider(url, nesting, callback) {

        // устранение состояния гонки 
        if (checkSpidering(url, callback)) {
            return true;
        }

        // использовать стандартный алгоритм
        webSpiderMethod(url, basePath65, nesting,
            download, spiderLinks, callback);
    }

    // Функция queue создает новую очередь, первым аргументом передается функция 
    //      worker в которой выполняется задание, второй аргумент это ограничение. 
    //      Функция worker принимает запускаемое задание и функцию для вызова после 
    //      завершения задания.
    //      const q = async.queue(worker, concurrency)
    //      function worker(task, callback)

    // Заданием может быть не только функция, worker автоматически выбирает наиболее 
    //      подходящий способ выполнения задания. 

    // Функция async.queue повторяет функционал объекта TaskQueue.

    // создать новую очередь с ограничением параллельной обработки
    const downloadQueue = async.queue(
        (taskData, callback) => webSpider(taskData.link, taskData.nesting - 1, callback),
        2
    );

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
        links.forEach(function (link) {

            // 
            let taskData = { link: link, nesting: nesting };

            // - добавить новое задание в очередь,
            // - Функция обратного вызова будет вызвана функцией worker 
            //      после завершения выполнения задания
            downloadQueue.push(taskData, err => {
                if (err) {
                    hasErrors = true;
                    return callback(err);
                }
                if (++completed === links.length && !hasErrors) {
                    callback();
                }
            });
        });
    }
}

// --- Запуск.

async_sequential_execution();
async_sequential_iteration();
async_parallel_execution();
async_limited_parallel_execution();