"use strict";

// 
const EventEmitter = require('events').EventEmitter;

// класс SubsetSum наследуется от EventEmitter, чтобы генерировать событие
//      при обнаружении подмножества удовлетворяющего условиям задачи
class SubsetSum extends EventEmitter {

    // - метод _combine запускает перебор всех возможных комбинаций, в конце 
    //      генерирует событие 'end', которое сообщает о том, что все 
    //      совпадения найдены, 
    // - событие 'end' будет сгенерировано после завершения _combine, 
    //      благодаря ее синхронной природе
    constructor(sum, set) {
        super();
        this.sum = sum;
        this.set = set;
        this.totalSubsets = 0;
    }

    // этот метод является синхронным, алгоритм рекурсивно создает все возможные 
    //      подмножества без передачи управления циклу событий
    _combine(set, subset) {
        for (let i = 0; i < set.length; i++) {
            let newSubset = subset.concat(set[i]);
            this._combine(set.slice(i + 1), newSubset);
            this._processSubset(newSubset);
        }
    }

    // обрабатывает подмножества, проверяет условие алгоритма
    _processSubset(subset) {
        console.log('Subset', ++this.totalSubsets, subset);
        const res = subset.reduce((prev, item) => (prev + item), 0);
        if (res == this.sum) {
            this.emit('match', subset);
            //this.emit('match', `set=[${subset}] / sum=${res}`);
        }
    }

    // запуск
    start() {
        this._combine(this.set, []);
        this.emit('end');
    }
}

// 
module.exports = SubsetSum;