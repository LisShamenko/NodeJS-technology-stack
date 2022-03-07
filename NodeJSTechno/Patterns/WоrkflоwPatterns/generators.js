"use strict";

const path = require('path');
const fs = require('fs');
const thunkify = require('thunkify');
const co = require('co');
const request = require('request');
const mkdirp = require('mkdirp');

// 
const request_thunk = thunkify(request);
const mkdirp_thunk = thunkify(mkdirp);
const readFile_thunk = thunkify(fs.readFile);
const writeFile_thunk = thunkify(fs.writeFile);
const nextTick_thunk = thunkify(process.nextTick);

//
const { generatorTaskQueue } = require('./../Utilities/VarietyTaskQueues');
const OpsRaceConds = require('./../Utilities/OpsRaceConds');
const OpsURL = require('./../Utilities/OpsURL');
const OpsFiles = require('./../Utilities/OpsFiles');
const process_argv_url = "http://www.example.com";
const source83 = OpsFiles.getSourceFile('1.txt', './../dist/83', 'clone_of_');
const source84 = OpsFiles.getSourceFile('1.txt', './../dist/84', 'clone_of_');
const basePath86 = 'NodeJSTechno/Patterns/dist/86';
const basePath87 = 'NodeJSTechno/Patterns/dist/87';
const basePath88 = 'NodeJSTechno/Patterns/dist/88';



// --------------- 8. Generators.

// Генераторы - это разновидность подпрограмм, которые могут иметь различные точки входа.
//      Обычная функция имеет только одну точку входа. Выполнение генератора может быть 
//      приостановлено с помощью оператора yield и возобновлено позже. Генераторы полезны 
//      при реализации итераторов.

function generators_simple() {

    console.log('--- --- --- generators_simple');

    // метод next перезапускает генератор и возвращает объект:
    //  {
    //      value: <полученное значение>
    //      done: <true - выполнение завершено>
    //  }

    // функция генератора
    function* SimpleGenerator() {
        // yield - останавливает выполнение функции и возвращает значение
        yield 'foo';
        yield 'bar';
        return 'baz';
    }

    // возвращает новый объект генератора
    const simpleGenerator = SimpleGenerator();

    // первый вызов запускает генератор, генератор выполняется до первой команды yield,
    //      возвращет управление вызывающему коду и возвращает объект:
    //      { value: 'foo', done: false }
    console.log('--- simple generator: ' + simpleGenerator.next());

    // второй вызов возобновляет выполнение генератора со второй команды yield, 
    //      которая снова его приостанавливает и возвращает объект:
    //      { value: 'bar', done: false }
    console.log('--- simple generator: ' + simpleGenerator.next());

    // последняя команда присваивает свойству done значение true и возвращает объект:
    //      { value: 'baz', done: true }
    console.log('--- simple generator: ' + simpleGenerator.next());
}

// --- 8.1 Итераторы.

function generators_iterators() {

    console.log('--- --- --- generators_iterators');

    // функция генератора
    function* iteratorGenerator(arr) {
        for (let i = 0; i < arr.length; i++) {
            yield arr[i];
        }
    }

    // вернуть объект генератора
    const iterator = iteratorGenerator(['foo', 'bar', 'baz']);

    // выполнить генератор
    let item = iterator.next();
    while (!item.done) {
        console.log(`--- iterator item: ${item.value}`);

        // генераторы сохраняют состояние между вызовами и восстанавливают его
        //      при возобновлении цикла
        item = iterator.next();
    }
}

// --- 8.2 Передача значений в генератор.

function generators_passing() {

    console.log('--- --- --- generators_passing');

    // 
    function* twoWayGenerator() {

        // значение, переданое генератору, присваивается переменной
        const passing_value = yield null;
        console.log(`--- passing value: ${passing_value}`);

        // обработка исключения возбужденного снаружи генератора
        try {
            const passing_error = yield null;
            console.log(`--- passing error: ${passing_error}`);
        }
        catch (err) {
            console.log(`--- err = ${err}`);
        }
    }

    // 
    const twoWay = twoWayGenerator();
    twoWay.next();

    // этот вызов передает генератору значение 'world'
    twoWay.next('world');

    // метод throw генерирует исключение в генераторе, когда оператор yield 
    //      возвращает значение внутри генератора, это исключение можно 
    //      перехватить и обработать как любое другое исключение
    twoWay.throw(new Error('отправил ошибку в генератор'));
}

// --- 8.3 Асинхронное выполнение.

function generators_async_flow() {

    console.log('--- --- --- generators_async_flow');

    // 3. управляет выполнением генератора
    function asyncFlow(generatorFunction) {

        // функция возобновляет работу генератора после завершения 
        //      каждой асинхронной операции
        function callback(err) {

            // 6. ошибка передается из readFile или writeFile
            if (err) {
                return generator.throw(err);
            }

            // 7. при успешном выполнении, определяется результат какой операции
            //      был получен и передается дальше в генератор
            const results = [].slice.call(arguments, 1);
            generator.next(results.length > 1 ? results : results[0]);
        }

        // 4. создается объект генератора и сразу запускается
        const generator = generatorFunction(callback);
        generator.next();
    }

    // 1. функция генератор, содержит синхронную операцию, которая выполняется
    //      как синхронная за счет вызова yield
    function* generator(callback) {

        // 5. callback вызывается при завершении каждой синхронной операции

        // операция чтения файла
        const content = yield fs.readFile(source83.getFull(), 'utf8', callback);

        // операция создания пути
        yield mkdirp(source83.getDistpath(), callback);

        // операция записи клона файла
        yield fs.writeFile(source83.getDist(), content, callback);

        // 
        console.log(`--- клонирование завершено: 
            ${source83.filename} -> ${source83.getDistname()} 
        `);
    }

    // 2. запуск, функция генератора передается в поток управления
    asyncFlow(generator);
}

// --- 8.4 Асинхронные преобразователи.

// Эту технологию можно применять с Promise и преобразователями. 
function generators_async_flow_thunks() {

    console.log('--- --- --- generators_async_flow_thunks');

    // 3. управляет потоком выполнения, версия asyncFlow() с преобразователем
    function asyncFlowWithThunks(generatorFunction) {

        function callback(err) {

            // 6. обработка ошибок
            if (err) {
                return generator.throw(err);
            }

            // 7.1. определить возвращаемое значение
            let results = [].slice.call(arguments, 1);
            results = results.length > 1 ? results : results[0];

            // 7.2. прочитать возвращаемое значение generator.next, в 
            //      котором содержится преобразователь и 
            //      передать промежуточный результат
            const nextResult = generator.next(results);
            const thunk = nextResult.value;

            // 7.3. вызвать сам преобразователь, внедрив специальную 
            //      функцию обратного вызова
            thunk && thunk(callback);
        }

        // 4.1. создается объект генератора
        const generator = generatorFunction();

        // 4.2. прочитать возвращаемое значение generator.next, в 
        //      котором содержится преобразователь
        const nextResult = generator.next();
        const thunk = nextResult.value;

        // 4.3. вызвать сам преобразователь, внедрив специальную 
        //      функцию обратного вызова
        thunk && thunk(callback);
    }

    // Преобразователь - это функция, которая получает все аргументы исходной функции, 
    //      и возвращает другую функцию, которая принимает только функцию обратного вызова.

    // функция преобразователь
    const readFileThunk = (filename, options) => {
        // 5.2. преобразователь возвращает функцию принимающую обратный вызов
        return (cb) => {
            fs.readFile(filename, options, cb);
        }
    };

    // функция преобразователь
    const mkdirpThunk = (filepath) => {
        // 5.2. преобразователь возвращает функцию принимающую обратный вызов
        return (cb) => {
            mkdirp(filepath, cb);
        }
    };

    // функция преобразователь
    const writeFileThunk = (filename, options) => {
        // 5.2. преобразователь возвращает функцию принимающую обратный вызов
        return (cb) => {
            fs.writeFile(filename, options, cb);
        }
    };

    // 1. функция генератор
    function* generator(callback) {

        // 5.1. вызвать преобразователи асинхронных операция

        // операция чтения файла
        const content = yield readFileThunk(source84.getFull(), 'utf8');

        // операция создания пути
        yield mkdirpThunk(source84.getDistpath());

        // операция записи клона файла
        yield writeFileThunk(source84.getDist(), content);

        // 
        console.log(`--- клонирование завершено: 
            ${source84.filename} -> ${source84.getDistname()} 
        `);
    }

    // 2. запуск
    asyncFlowWithThunks(generator);
}

// --- 8.5 Генераторы 'co'.

// suspend 
//      https://npmjs.org/package/suspend

// thunkify 
//      https://npmjs.org/package/thunkify

// co 
//      https://npmjs.org/package/co

// поддерживает несколько типов сущностей, передаваемых через yield:
//      - преобразователи;
//      - объекты Promise;
//      - массивы (параллельное выполнение);
//      - объекты (параллельное выполнение);
//      - генераторы (делегирование);
//      - функции генераторов (делегирование).

function generators_common_code(spiderLinks, basePath) {

    // 
    function* download(url, filename) {
        console.log(`--- загрузка url: ${url}`);

        // операция запроса url
        const response = yield request_thunk(url);
        const body = response[1];

        // операция создания пути
        yield mkdirp_thunk(path.dirname(filename));

        // операция записи файла
        yield writeFile_thunk(filename, body);

        // 
        console.log(`--- url загружен и записан в файл`);
        return body;
    }

    // устранение состояния гонки 
    let raceConds = OpsRaceConds();

    // 
    function* webSpider(url, nesting) {

        // устранение состояния гонки 
        if (raceConds.check(url)) {
            return nextTick_thunk();
        }

        // 
        const filename = OpsURL.getNameByURL(url, basePath);
        let body;

        // остается возможность использования блока try...catch для обработки 
        //      исключений и ключевого слова throw для передачи ошибок
        try {
            body = yield readFile_thunk(filename, 'utf8');
        }
        catch (err) {

            // 
            if (err.code !== 'ENOENT') {
                console.log(`--- err: ${err}`);
                throw err;
            }
            console.log(`--- файл ${filename} отсутствует`);

            // функция download является генератором, применение генераторов вместе
            //      с инструкцией yield обеспечивает 'co'
            body = yield download(url, filename);
        }

        // 
        console.log(`--- загружен url: ${url}`);
        yield spiderLinks(webSpider, url, body, nesting);
    }

    // здесь необходимо вызвать 'co', чтобы обернуть генератор, 'co' автоматически и 
    //      рекурсивно обертывает любой генератор, передаваемый оператору yield, 
    //      поэтому остальной код полностью независим от 'co'
    co(function* () {
        try {
            yield webSpider(process_argv_url, 1);
            console.log(`--- complete`);
        }
        catch (err) {
            console.log(`--- err: ${err}`);
        }
    });
}

// --- 8.6 Последовательное выполнение.

function generators_sequential_execution() {

    console.log('--- --- --- generators_sequential_execution');

    // решение на основе 'co' поддерживает как преобразователи, так и объекты Promise,
    //      код останется одинаковым при использовании обеих концепций

    // 
    function* spiderLinks(webSpider, currentUrl, body, nesting) {
        if (nesting === 0) {
            return nextTick_thunk();
        }

        const links = OpsURL.getLinksFromBody(currentUrl, body);
        for (let i = 0; i < links.length; i++) {
            yield webSpider(links[i], nesting - 1);
        }
    }

    // 
    generators_common_code(spiderLinks, basePath86);
}

// --- 8.7 Параллельное выполнение.

// Шаблон 'преобразование генератора в преобразователь' - преобразование генератора в 
//      преобразователь с целью получить возможность запускать его параллельно или 
//      использовать его преимущества в алгоритмах, основанных на обратных вызовах или 
//      объектах Promise.

// Используя только операторы yield и генераторы не возможно организовать параллельное
//      выполнение задач.

function generators_parallel_execution() {

    console.log('--- --- --- generators_parallel_execution');

    //
    function* spiderLinks(webSpider, currentUrl, body, nesting) {
        if (nesting === 0) {
            return nextTick_thunk();
        }

        // все задания загрузки, являющиеся генераторами, собраны в один массив и
        //      переданы в вызывающий код при помощи оператора yield, эти задания 
        //      будут выполняться параллельно до завершения всех заданий, после
        //      чего будет возобновлено выполнение генератора spiderLinks
        const links = OpsURL.getLinksFromBody(currentUrl, body);
        const tasks = links.map(link => webSpider(link, nesting - 1));
        yield tasks;
    }

    // 
    generators_common_code(spiderLinks, basePath87);
}

// --- 8.8 Ограниченное параллельное выполнение.

function generators_limited_parallel() {

    console.log('--- --- --- generators_limited_parallel');

    const downloadQueue = new generatorTaskQueue(2);

    // после выполнения каждого задания вызывается функция done(), что позволяет 
    //      подсчитать количество загруженных ссылок и уведомить преобразователя 
    //      о загрузке всех ссылок
    function spiderLinks(webSpider, currentUrl, body, nesting) {
        if (nesting === 0) {
            return nextTick_thunk();
        }

        // эффекта параллельного выполнения можно достичь при помощи 
        //      применения функций обратного вызова

        // возвращает преобразователь
        return (callback) => {

            // 
            let completed = 0, hasErrors = false;
            const links = OpsURL.getLinksFromBody(currentUrl, body);
            if (links.length === 0) {
                return process.nextTick(callback);
            }

            // 
            function done(err, result) {
                if (err && !hasErrors) {
                    hasErrors = true;
                    callback(err);
                }
                if (++completed === links.length && !hasErrors) {
                    callback();
                }
            }

            // вариант с promise
            //
            //      for (let i = 0; i < links.length; i++) {
            //          co(webSpider(links[i], nesting - 1)).then(done);
            //      }

            //
            links.forEach(link => {
                // для поддержания заданного количества рабочих процессов
                //      используется очередь
                downloadQueue.pushTask(function* () {
                    yield webSpider(link, nesting - 1);
                    done();
                });
            });
        }
    }

    // 
    generators_common_code(spiderLinks, basePath88);
}

// --- Запуск.

generators_simple();
generators_iterators();
generators_passing();
generators_async_flow();
generators_async_flow_thunks();

// co
generators_sequential_execution();
generators_parallel_execution();
generators_limited_parallel();