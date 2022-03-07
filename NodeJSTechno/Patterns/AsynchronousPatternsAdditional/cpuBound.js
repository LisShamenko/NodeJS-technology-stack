"use strict";

const path = require('path');
const http = require('http');
const url = require('url');
const request = require('request');
const { interval } = require('rxjs');

// 
const port = 3000;



// --------------- 36. Выполнение вычислительных заданий.

// Вызовы асинхронных операций собираются в стеке, чтобы дать возможность 
//      выполняться циклу событий, что позволяет выполнить обработку других 
//      запросов.
// Вызов длительной синхронной операции, которая никогда не передает управление 
//      циклу событий, приводит к блокировке цикла событий. Такие операции 
//      называются вычислительными, поскольку их основной особенностью является 
//      выполнение вычислительных операций с существенным потреблением центрального 
//      процессора, а не операции ввода/вывода.

// сервер
function AppFactory(callback) {
    return new Promise(async (resolve, reject) => {
        const server = http.createServer(
            (req, res) => {

                // url: '/subsetSum?data=<Array>&sum=<Integer>'

                // 
                const purl = url.parse(req.url, true);
                const data = JSON.parse(purl.query.data);
                if (purl.pathname === '/subsetSum') {
                    res.writeHead(200);
                    callback(data.sum, data.set, res);
                }
                else {
                    res.writeHead(200).end('ok');
                }
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
function getSubsetData(count = 20, max = 100) {
    let sum = 0;
    let set = [];
    for (let i = 0; i < count; i++) {
        let num = Math.floor(Math.random() * max);
        sum += (Math.random() * 100 > 66) ? num : 0;
        set.push(num);
    }
    return { set, sum };
}

// 
async function testRequests() {
    return new Promise(async (resolve, reject) => {
        const data = getSubsetData(5);
        request(
            {
                url: `http://localhost:${port}/subsetSum?data=${JSON.stringify(data)}`
            },
            (err, res) => {
                resolve({ err, res });
            }
        );
    });
}

// --- 36.1 Решение задачи выделения подмножеств с заданной суммой.

// Нужно определить содержит ли множество целых чисел непустое подмножество 
//      элементов, сумма которых равна заданному значению. Например, если 
//      заданное число равно 0, то для множества [1,2,–4,5,–3] ответом будут 
//      множества: [1, 2, –3] и [2, –4, 5, –3].

async function computing_task() {
    console.log(`
        --- --- --- computing_task --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        const SubsetSum = require('./CPUBound/subsetSum');

        //
        const server = await AppFactory((sum, set, res) => {
            const subsetSum = new SubsetSum(sum, set);
            subsetSum
                .on('match', (match) => {
                    res.write(`${JSON.stringify(match)}`)
                })
                .on('end', () => {
                    res.end()
                })
                .start();
        });

        // 
        const { err, res } = await testRequests();
        console.log(`--- err: ${err} --- res: ${JSON.stringify(res.body)}`);
        resolve(server);
    });
}

// Запуск:
//      node app
//      curl -G http://localhost:8000/subsetSum --data-urlencode "data=[116, 119,101,101,-116,109,101,-105, -102,117,-115,-97,119,-116,-104,-105,115]" --data-urlencode "sum=0"
//      curl -G http://localhost:8000

// Цикл событий выполняется в одном потоке и если этот поток заблокирован длительной 
//      синхронной операцией, то он не сможет выполнить ни одной итерации, то есть
//      не сможет даже просто вывести `I'm alive!`.

// --- 36.2 Чередование с помощью функции setImmediate.

// Шаблон 'Асинхронное чередование' - этот шаблон заключается в чередовании этапов 
//      продолжительной синхронной задачи с помощью функции setImmediate.

// Вычислительные алгоритмы разбиваются на несколько этапов при помощи рекурсии или 
//      циклов. Самое простое решение, это возврат управления в цикл после каждого 
//      такого этапа. Операции ввода/вывода, ожидающие обработки, выполняются 
//      циклом событий в промежутках между этапами, когда продолжительный вычислительный
//      алгоритм уступает центральный процессор. Функция setImmediate позволяет 
//      запланировать следующий этап алгоритма на момент времени после обработки 
//      ожидающих запросов ввода/вывода.

// Метод process.nextTick нельзя использовать для приостановки продолжительных заданий, 
//      поскольку nextTick откладывает операцию на время, перед любыми ожидающими 
//      операциями ввода/вывода, что может вызвать задержку операций ввода/вывода 
//      при повторных вызовах.
//      https://github.com/nodejs/node-v0.x-archive/issues/3335

// Откладывание выполнения при помощи setImmediate вносит определенные затраты. 
//      При большом количестве этапов это может иметь существенное значение.
//      В этом случае, функцию setImmediate можно использовать после определенного
//      числа этапов, а не после каждого, но это не устранит причину.

// Когда задача выполняется нерегулярно или в фоновом режиме и не слишком долго, то
//      использование функции setImmediate для чередования является самым простым и 
//      наиболее эффективным способом предотвращения блокировки цикла событий.

async function computing_task_immediate() {
    console.log(`
        --- --- --- computing_task_immediate --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        const SubsetSum = require('./CPUBound/subsetSumDefer');

        // 
        const server = await AppFactory((sum, set, res) => {
            const subsetSum = new SubsetSum(sum, set);
            subsetSum
                .on('match', (match) => {
                    res.write(`${JSON.stringify(match)}`)
                })
                .on('end', () => {
                    res.end()
                })
                .start();
        });

        // 
        const { err, res } = await testRequests();
        console.log(`--- err: ${err} --- res: ${JSON.stringify(res.body)}`);
        resolve(server);
    });
}

// --- 36.3 Использование нескольких процессов.

// child_process 
//      https://nodejs.org/api/child_process.html

// Шаблон 'Дочерний процессор' - шаблон предотвращает блокировку цикла событий, 
//      используя дочерние процессы для обработки синхронных алгоритмов. Этот
//      шаблон дает следующие преимущества:
//      - синхронное задание может выполняться на предельной скорости, поскольку 
//           отсутствует необходимость чередовать действия;
//      - работа с процессами реализуется проще, чем изменение алгоритма для 
//           применения setImmediate и позволяет использовать несколько процессоров 
//           без необходимости масштабировать основное приложение;
//      - если необходима максимальная производительность, то внешний процесс можно 
//           написать на одном из языков низкого уровня, например C++.

// Функции child_process.fork создает новый дочерний процесс и автоматически обеспечивает 
//      канал для связи с ним, что позволяет обмениваться информацией, используя интерфейс, 
//      очень похожий на EventEmitter. 

// Реализация шаблона:
// - Модуль processPool.js - создает пул процессов. Запуск нового процесса является 
//      затратной операцией, поэтому пул готовых процессов позволит сэкономить время и 
//      ресурсы центрального процессора. Пул поможет ограничить число одновременно 
//      выполняющихся процессов, что позволит исключить риск атак 'отказ в обслуживании' 
//      (denial ­of ­service, DoS).
// - Модуль subsetSumFork.js - абстрагирует задание SubsetSum, которое выполняется 
//      в дочернем процессе. Этот модуль взаимодействует с дочерним процессом и выводит
//      результаты в том виде, как если бы они поступали из текущего приложения.
// - Модуль дочернего процесса - программа NodeJS, предназначенная только для выполнения 
//      синхронного алгоритма и передачи результатов родительскому процессу.

// DoS-атака - это попытка сделать машину или сетевой ресурс недоступным для предполагаемых 
//      пользователей, чтобы временно или постоянно отключить или приостановить службу, 
//      действующую на подключенном к Интернету узле.

async function computing_task_process() {
    console.log(`
        --- --- --- computing_task_process --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // объекту ProcessPool передается файл, который будет запущен как дочерний 
        //      процесс, максимальная емкость пула устанавливается равной 2
        const ProcessPool = require('./CPUBound/processPool');
        const workers = new ProcessPool(
            path.join(__dirname, './CPUBound/subsetSumWorker.js'),
            path.join(__dirname, './CPUBound/subsetSum.js'),
            2
        );

        //
        const SubsetSumFork = require('./CPUBound/subsetSumFork');
        const server = await AppFactory((sum, set, res) => {
            const subsetSum = new SubsetSumFork(workers, sum, set);
            subsetSum
                .on('match', (match) => {
                    res.write(`${JSON.stringify(match)}`)
                })
                .on('end', () => {
                    res.end()
                })
                .start();
        });

        //
        const { err, res } = await testRequests();
        console.log(`--- err: ${err} --- res: ${JSON.stringify(res.body)}`);
        resolve(server);
        workers.close();
    });
}

// Альтернативой процессам могут стать потоки выполнения. Потоки использовать проще, но 
//      полноценные процессы способны обеспечить большую гибкость и более высокий уровень 
//      изоляции в случае возникновения таких проблем, как зависание или сбой.

// webworker-threads
//      https://npmjs.org/package/webworker-threads

// --- Запуск.

(async () => {

    // 
    let server;
    server = await computing_task();
    server.close();

    //
    server = await computing_task_immediate();
    server.close();

    // 
    server = await computing_task_process();
    server.close();
})();