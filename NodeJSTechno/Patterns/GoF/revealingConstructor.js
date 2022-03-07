"use strict";

const events = require('events');
const EventEmitter = events.EventEmitter;



// --------------- 16. Открытый конструктор (Revealing Constructor).

// Статья Доменика Деникола (Domenic Denicola) автора шаблона:
//      https://blog.domenic.me/the-revealing-constructor-pattern/

// --- 16.1 Шаблон 'закрытый генератор событий'.

// Шаблон 'закрытый генератор событий' - это шаблон в котором откртытый конструктор
//      применяетя для создания особого вида генераторов событий, не позволяющего 
//      вызывать свой метод emit

// закрытый генератор - генератор событий, доступный только для чтения
function revealing_constructor() {

    // 
    class ProtectedGenerator extends EventEmitter {
        constructor(executor) {

            // Исполняющая функция - это функция, которую принимает конструктор. 
            //      Она вызывается внутри консруктора и используется для работы 
            //      с закрытой частью состояния объекта. В конструкторе могут
            //      быть определены функции доступа к закрытому состоянию, их 
            //      передача в именованную функцию, позволяет предоставить
            //      доступ к этим функциям внешнему коду, который создает объект и 
            //      объявляет именованную функцию.

            // Например, в конструкторе Promise в исполняющую функцию передаются 
            //      resolve и reject. Коснтруктор предоставляет код функций resolve и 
            //      reject и вызвать их нельзя будет нигде кроме обработчика 
            //      в объекте Promise.

            // инициализация генератора событий
            super();

            // создается резервная копия функции emit с последующим ее удалением
            const emit = this.emit.bind(this);
            this.emit = undefined;

            // резервная копия передается в исполняющую функцию 
            executor(emit);
        }
    };

    // резервная копия метода emit становится локальной переменной и будет
    //      доступна только внутри исполняющей функции (executor), так как
    //      метод emit был удален в консрукторе при создании
    const ticker = new ProtectedGenerator((emit) => {
        let tickCount = 0;
        let counter = setInterval(() => {
            if (tickCount >= 10)
                clearInterval(counter);
            else
                emit('tick', tickCount++);

        }, 500);
    });

    // объект ticker может подписываться на свои события, как любой генератор 
    //      событий, но при вызове emit произойдет ошибка:
    //      TypeError: ticker.emit is not a function
    ticker.on('tick', (tickCount) => console.log(`--- ${tickCount} tikcs`));

    // следующий код вызовет ошибку
    try {
        ticker.emit('tick', {});
    }
    catch (err) {
        console.log(`--- err = ${err}`);
    }

    // защиту генератора событий можно обойти 
    events.prototype.emit.call(ticker, 'tick', {});
}

// --- 16.2 Реальное применение.

// используется в конструкторе Promise
//      https://streams.spec.whatwg.org

// --- Запуск.

revealing_constructor();