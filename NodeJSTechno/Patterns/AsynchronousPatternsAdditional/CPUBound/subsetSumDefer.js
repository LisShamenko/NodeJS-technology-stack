"use strict";

//
const EventEmitter = require('events').EventEmitter;

// 
class SubsetSumDefer extends EventEmitter {
    constructor(sum, set) {
        super();
        this.sum = sum;
        this.set = set;
        this.totalSubsets = 0;
    }

    // - алгоритм не является синхронным, поэтому генерации события end недостаточно,
    //      чтобы сигнализировать об окончании перебора всех комбинаций,
    // - событие end будет сгенерировано, когда все асинхронные экземпляры метода 
    //      _combine завершатся
    _combineInterleaved(set, subset) {

        // количество запущенных методов _combine
        this.runningCombine++;

        // setImmediate откладывает выполнение следующего этапа на момент 
        //      после обработки ожидающих операций ввода/вывода
        setImmediate(() => {
            this._combine(set, subset);
            if (--this.runningCombine === 0) {
                this.emit('end');
            }
        });
    }

    //
    _combine(set, subset) {
        for (let i = 0; i < set.length; i++) {
            let newSubset = subset.concat(set[i]);

            // рекурсивный вызов заменяется его отложенной версией
            this._combineInterleaved(set.slice(i + 1), newSubset);
            this._processSubset(newSubset);
        }
    }

    //
    _processSubset(subset) {
        console.log('Subset', ++this.totalSubsets, subset);
        const res = subset.reduce((prev, item) => prev + item, 0);
        if (res == this.sum) {
            this.emit('match', subset);
            //this.emit('match', `set=[${subset}] / sum=${res}`);
        }
    }

    // 
    start() {
        this.runningCombine = 0;
        this._combineInterleaved(this.set, []);
    }
}
module.exports = SubsetSumDefer;