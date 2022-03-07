"use strict";

// --- 36.3 Реализация пула процессов.

// функция fork используется для создания новых процессов
const fork = require('child_process').fork;

// 
class ProcessPool {
    constructor(fileWorker, subsetPath, poolMax) {
        this.fileWorker = fileWorker;
        this.subsetPath = subsetPath;
        this.poolMax = poolMax;
        // набор готовых к использованию запущенных процессов
        this.pool = [];
        // список используемых в настоящее время процессов
        this.active = [];
        // очередь функций обратного вызова для всех запросов, которые не могут быть 
        //      выполнены немедленно из­-за отсутствия доступных процессов
        this.waiting = [];
    }

    //
    acquire(callback) {
        let worker;

        // если в пуле имеется готовый к использованию процесс, то он просто перемещается 
        //      в список active и возвращается вызовом функции callback 
        if (this.pool.length > 0) {
            worker = this.pool.pop();
            this.active.push(worker);
            // вызов callback откладывается, чтобы избежать высвобождения Залго
            return process.nextTick(callback.bind(null, null, worker));
        }

        // если в пуле нет доступных процессов и достигнуто максимальное число запущенных
        //      процессов, то обратный вызов помещается в список ожидания waiting, пока
        //      не освободится один из процессов
        if (this.active.length >= this.poolMax) {
            return this.waiting.push(callback);
        }

        // если не достигнуто максимальное число запущенных процессов, то создается новый 
        //      процесс вызовом child_process.fork, добавляется в список active и 
        //      возвращается функцией обратного вызова callback
        worker = fork(this.fileWorker, [this.subsetPath]);
        this.active.push(worker);
        process.nextTick(callback.bind(null, null, worker));
    }

    // - процессы не уничтожаются, а переназначаются, что позволяет экономить 
    //      время, которое потребовалось бы на запуск процесса

    // - для уменьшения объема не используемой долгое время памяти и повышения 
    //      надежности пула:
    //      - для освобождения памяти можно уничтожать процессы, простаивающие 
    //        определенное время
    //      - добавить механизм уничтожения зависших процессов или перезапуска 
    //        процессов в работе которых возник сбой

    //    
    release(worker) {

        // если в списке waiting имеется запрос, то освободившийся процесс переназначается
        //      на выполнение ожидающего задания, для этого в функцию обратного вызова
        //      из начала списка передается освободившийся рабочий процесс
        if (this.waiting.length > 0) {
            const waitingCallback = this.waiting.shift();
            waitingCallback(null, worker);
        }

        // если список waiting пуст, то рабочий процесс исключается из списка active и 
        //      помещается обратно в пул.
        this.active = this.active.filter(w => worker !== w);
        this.pool.push(worker);
    }

    // 
    close() {
        this.pool.forEach(worker => worker.kill());
    }
}

// 
module.exports = ProcessPool;