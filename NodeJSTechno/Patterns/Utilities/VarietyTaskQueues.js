"use strict";

const co = require('co');



// --- 5.6 Ограниченное параллельное выполнение.

// 
function arrayTaskQueue(limit) {

    // concurrency - предельное количество параллельно выполняющихся заданий
    let concurrency = limit;
    // подсчет запущенных заданий 
    let running = 0;
    // очередь заданий
    let queue = [];

    // добавляет новые задания в очередь
    function pushTask(task) {
        queue.push(task);
        // автоматически запустить обработку заданий
        next();
    }

    //
    function taskCallback() {
        running--;
        next();
    }

    // 
    function next() {

        // запускает несколько заданий из очереди, учитывая установленное ограничение
        while (running < concurrency && queue.length) {
            const task = queue.shift();

            // выполнить задание и увеличить счетчик
            task(taskCallback);
            running++;
        }
    }

    //
    return { pushTask, next };
}



// 
class promiseTaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    pushTask(task) {
        this.queue.push(task);
        this.next();
    }

    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            // вызывается метод then() объекта Promise
            task().then(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }
};

// 
class generatorTaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
        this.consumerQueue = [];

        // запуск рабочих процессов
        this.spawnWorkers(concurrency);
    }

    // рабочие процессы выступают в роли потребителей, а производитель это 
    //      код, использующий метод pushTask
    pushTask(task) {
        if (this.consumerQueue.length !== 0) {

            // вызывает callback функцию из consumerQueue, что разблокирует 
            //      рабочий процесс
            let consumer = this.consumerQueue.shift();
            consumer(null, task);
        } 
        else {

            // если массив consumerQueue пуст, то все рабочие процессы заняты и
            //      задача добавляется в очередь ожидания
            this.queue.push(task);
        }
    }

    // рабочие процессы - это генераторы завернутые в 'co' и выполняющиеся
    //      параллельно
    spawnWorkers(concurrency) {
        const self = this;
        for (let i = 0; i < concurrency; i++) {

            // запуск рабочего процесса
            co(function* () {
                // бесконечный цикл, который блокируется yield в ожидании 
                //      поступления нового задания в очередь, после чего
                //      передает управление заданию и ожидает его завершения
                while (true) {
                    const task = yield self.nextTask();
                    yield task;
                }
            });
        }
    }

    // 1. Метод возвращает преобразователь, допустимый в операторе yield, когда 
    //      используется решение co.
    // 2. Функция обратного вызова, возвращаемая преобразователем, вызывается 
    //      при передаче следующего задания в очередь queue. Это немедленно разблокирует 
    //      рабочий процесс и передает ему следующее задание через оператор yield.
    // 3. Если в очереди больше нет заданий, то в consumerQueue передается callback
    //      функция. Это переводит рабочий процесс в режим ожидания. Callback функция
    //      вызывается при появлении нового задания, что возобновит выполнение 
    //      соответствующего рабочего процесса.

    // здесь происходит ожидание появления следующего задания в очереди
    nextTask() {
        return (callback) => {
            if (this.queue.length !== 0) {
                return callback(null, this.queue.shift());
            }
            this.consumerQueue.push(callback);
        }
    }
}

// 
module.exports.arrayTaskQueue = arrayTaskQueue;
module.exports.promiseTaskQueue = promiseTaskQueue;
module.exports.generatorTaskQueue = generatorTaskQueue;