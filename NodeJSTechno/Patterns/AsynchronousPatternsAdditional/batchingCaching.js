"use strict";

// библиотеки
const path = require('path');
const http = require('http');
const url = require('url');
const level = require('level');
const sublevel = require('level-sublevel');

// 
const databaseСreator = require('./databaseСreator');
const testRequests = require('./testRequests');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['35'];

// 
const port = 3000;
const dbpath35 = path.join(basepath, './35/example-db');



// --------------- 35. Группировка и кэширование.

// 
function AppFactoryCallback(salesApp) {
    return new Promise(async (resolve, reject) => {
        const server = http.createServer(
            (req, res) => {
                const query = url.parse(req.url, true).query;

                // используется callback-версия
                salesApp.totalSales(query.item, (err, sum) => {
                    res.writeHead(200).end(`${query.item} :: ${sum}`);
                });
            }
        ).listen(
            port,
            () => {
                console.log(`--- server: http://localhost:${port}`);
                resolve(server);
            });
    });
}

// 
function AppFactoryPromise(salesApp) {
    return new Promise(async (resolve, reject) => {
        const server = http.createServer(
            function (req, res) {
                const query = url.parse(req.url, true).query;

                // используется promise-версия 
                salesApp.totalSales(query.item)
                    .then(function (sum) {
                        res.writeHead(200).end(`${query.item} :: ${sum}`);
                    });
            }
        ).listen(
            port,
            () => {
                console.log(`--- server: http://localhost:${port}`);
                resolve(server);
            });
    });
}

// --- 35.1 Реализация сервера без кэширования и группировки операций.

//  
async function no_caching_grouping(salesDb) {
    console.log(`
        --- --- --- no_caching_grouping --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        const salesFactory = require('./BatchingCaching/salesFactory');

        //
        const salesApp = salesFactory(salesDb);
        const server = await AppFactoryCallback(salesApp);
        resolve(server);
    });
}

// --- 35.2 Группировка асинхронных операций.

// При вызове асинхронной функции в момент, когда аналогичный вызов уже находится
//      в режиме ожидания, обратный вызов присоединяется к уже выполняемой операции и
//      новый запрос не создается.

// Шаблон 'Группировка операций' - сводится к тому, что при поступлении идентичных 
//      запросов обратные вызовы помещаются в очередь, после завершения асинхронной 
//      операции вызываются все функции, имеющиеся в очереди. Шаблон наиболее 
//      эффективен в высоконагруженных приложениях с медленным программным интерфейсом, 
//      именно в таких условиях имеется возможность группировать наибольшее число 
//      запросов. Позволяет получить огромный выигрыш производительности, за счет 
//      простой группировки без сложного механизма кэширования и проверки 
//      действительности кэша.

//  
async function grouping_asynchronous(salesDb) {
    console.log(`
        --- --- --- grouping_asynchronous --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        //
        const salesFactory = require('./BatchingCaching/salesFactory');
        const salesBatchFactory = require('./BatchingCaching/salesBatchFactory');

        // 
        let salesApp;
        salesApp = salesFactory(salesDb);
        salesApp = salesBatchFactory(salesApp);
        const server = await AppFactoryCallback(salesApp);
        resolve(server);
    });
}

// --- 35.3 Кэширование асинхронных запросов.

// Проблема шаблона 'Группировка операций' в том, что чем быстрее программный 
//      интерфейс, тем меньше запросов можно сгруппировать. Тогда для более 
//      быстрого программного интерфейса можно приментить шаблон агрессивного 
//      кэширования, если есть увереность в том, что результаты вызовов остаются 
//      актуальными достаточно долго.

// Шаблон 'Кэширование асинхронных операций' - результат запроса сохраняется 
//      в кэше, который может быть переменной, базой данных или сервером кэширования, 
//      тогда при следующем обращении результат можно извлечь непосредственно 
//      из кэша, не инициируя нового запроса. В асинхронном программировании этот 
//      шаблон отличается дополнительной поддержкой группировки запросов. Так как 
//      одновременно может обрабатываться несколько запросов, то при их завершении 
//      кэш может быть сохранен несколько раз. Группировка позволяет избежать этого 
//      эффекта. 

// Дополнительной сложностью этого шаблона является предотвращение антишаблона 
//      высвобождения Залго. Необходимо гарантировать только асинхронный возврат 
//      кэшированных значений, даже если доступ к кэшу является синхронной 
//      операцией.

// memoizee - пакет асинхронной мемоизации. Мемоизация - один из способов кэширования, 
//      когда в кэше сохраняются результаты выполнения функции.
//      https://npmjs.org/package/memoizee

// 
async function caching_asynchronous(salesDb) {
    console.log(`
        --- --- --- caching_asynchronous --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        //
        const salesFactory = require('./BatchingCaching/salesFactory');
        const salesCacheFactory = require('./BatchingCaching/salesCacheFactory');

        // 
        let salesApp;
        salesApp = salesFactory(salesDb);
        salesApp = salesCacheFactory(salesApp);
        const server = await AppFactoryCallback(salesApp);
        resolve({ server, salesApp });
    });
}

// Большое количество кэшированных значений может потреблять слишком много памяти. 
//      Применение алгоритма вытеснения давно неиспользуемых значений (Least Recently 
//      Used, LRU) может помочь снизить затраты памяти.

// Если приложение состоит из нескольких процессов, то использование простых переменных
//      приведет к несогласованности данных между разными экземплярами сервера. 
//      Для решения проблемы следует использовать общее хранилище для кэша, например, 
//      Redis или Memcached.

// Ручная очистка кэша, в отличие от механизма истечения срока действия, продлевает 
//      существование кэша и позволяет возвращать более актуальные данные, но таким 
//      кэшем сложнее управлять.

// Redis 
//      http://redis.io 

// Memcached 
//      http:// memcached.org

// --- 35.4 Группировка и кэширование с использованием объектов Promise.

// - К одному объекту Promise можно подключить несколько обработчиков then, а это 
//      именно то, что требуется для группировки запросов.
// - Обработчик then гарантированно будет вызван хотя бы один раз, даже если он 
//      подключен после разрешения объекта Promise. Объект Promise уже кэширует 
//      вычисленное значение, что обеспечивает естественный механизм возврата 
//      кэшированного значения асинхронным образом. Это позволяет реализовать 
//      группировку и кэширование.
// - Обработчики then всегда вызываются асинхронно.

async function using_promise(salesDb) {
    console.log(`
        --- --- --- using_promise --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        //
        const salesFactory = require('./BatchingCaching/salesFactory');
        const salesPromisesFactory = require('./BatchingCaching/salesPromisesFactory');

        // 
        let salesApp;
        salesApp = salesFactory(salesDb);
        salesApp = salesPromisesFactory(salesApp);
        const server = await AppFactoryPromise(salesApp);
        resolve({ server, salesApp });
    });
}

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    // 
    const items = ['foo', 'bar', 'baz'];
    const creator = databaseСreator(dbpath35, items);
    await creator.automation(creator);

    // создание БД
    const DB = level(dbpath35, { valueEncoding: 'json' });
    const subDB = sublevel(DB);
    const salesDb = subDB.sublevel('sales');

    //
    let server;
    server = await no_caching_grouping(salesDb);
    await testRequests('foo');
    server.close();

    // 
    server = await grouping_asynchronous(salesDb);
    await testRequests('foo');
    server.close();

    //
    server = await caching_asynchronous(salesDb);
    await testRequests('foo');
    server.server.close();
    server.salesApp.close();

    // 
    server = await using_promise(salesDb);
    await testRequests('foo');
    server.server.close();
    server.salesApp.close();
})();
