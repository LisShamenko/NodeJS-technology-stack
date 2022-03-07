"use strict";

const fs = require('fs');
const path = require('path');

const filename174 = path.join(__dirname, './../dist/17/test174.txt');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['17'];



// --------------- 17. Прокси (proxy).

// Прокси - это объект, который управляет доступом к другому объекту, называемому 
//      субъектом. Прокси и субъект имеют одинаковый интерфейс, что позволяет прокси
//      подменять субъект. Прокси перехватывает операции субъекта, расширяя или 
//      дополняя его модель поведения.

// delegates - библиотека для создания прокси
//      https://npmjs.org/package/delegates

// субъект
const terms = {
    foo: () => 'foo',
    bar: () => 'bar',
    baz: () => 'baz',
}

// --- 17.1 Композиция объектов.

function objects_composition() {
    console.log(`
        --- --- --- objects_composition --- --- ---
    `);

    // Композиция позволяет объединить один объект с другим для расширения или 
    //      использования его функционала. В прокси сохраняется ссылка на субъект
    //      в виде переменной экземпляра или замыкания. Субъект может быть внедрен
    //      через конструктор или создан прокси.

    // Преимущества: самый безопасный, поскольку субъект остается нетронутым. 
    // Недостатки: необходимо вручную делегировать все методы или даже свойства.

    // Когда требуется управлять инициализацией субъекта (отложенная инициализация), 
    //      композиция становится обязательным решением.

    // 
    try {
        const proxy_composition = createProxy_composition(terms);
        console.log(`--- foo: ${proxy_composition.foo()}`);
        console.log(`--- bar: ${proxy_composition.bar()}`);
        console.log(`--- baz: ${proxy_composition.baz()}`);
    }
    catch (err) {
        console.log(`--- baz error: ${err.message}`);
    }

    // 
    function createProxy_composition(subject) {

        // этот шаг требуется для сохранения цепочки прототипов, это делает
        //      прокси совместимым с кодом в котором используется субъект, 
        //      так инструкция 'proxy instanceof Subject' будет возвращать true
        const proto = Object.getPrototypeOf(subject);
        function Proxy(subject) {
            this.subject = subject;
        }
        Proxy.prototype = Object.create(proto);

        // вызовы методов, которые планируется обрабатывать, перехватываюбтся 
        //      прокси, вызовы остальных методов делегируются субъекту

        // свойства можно делегировать с помощью метода Object.defineProperty
        //      https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty.

        // прокси перехватывает метод
        Proxy.prototype.foo = function () {
            return this.subject.foo() + ' world!';
        };

        // прокси делегирует выполнение метода субъекту
        Proxy.prototype.bar = function () {
            return this.subject.bar.apply(this.subject, arguments);
        };

        //
        return new Proxy(subject);
    }
}

// --- 17.2 Литерал объекта и фабрика.

function object_literal_and_factory() {
    console.log(`
        --- --- --- object_literal_and_factory --- --- ---
    `);

    // 
    try {
        const proxy_factory = createProxy_factory(terms);
        console.log(`--- foo: ${proxy_factory.foo()}`);
        console.log(`--- bar: ${proxy_factory.bar()}`);
        console.log(`--- baz: ${proxy_factory.baz()}`);
    }
    catch (err) {
        console.log(`--- baz error: ${err.message}`);
    }

    // 
    function createProxy_factory(subject) {
        return {
            // подменяемый метод
            foo: () => (subject.foo() + ' world!'),
            // делегируемый метод
            bar: () => (subject.bar.apply(subject, arguments))
        };
    }
}

// --- 17.3 Расширение объекта.

function object_extension() {
    console.log(`
        --- --- --- object_extension --- --- ---
    `);

    // Расширение объекта - этот способ проксирования заключается в изменении 
    //      субъекта напрямую, путем подмены реализации метода. Это удобно,
    //      когда требуется изменить один метод из многих, но его недостаток 
    //      в том, что требуется изменять субъект.

    // Преимущества: изменение субъекта избавляет от неудобств, связанных с 
    //      делегированием.
    // Недостатки: изменяет субъект.

    // 
    const proxy_extend = createProxy_extend(terms);
    console.log(`--- foo: ${proxy_extend.foo()}`);
    console.log(`--- bar: ${proxy_extend.bar()}`);
    console.log(`--- baz: ${proxy_extend.baz()}`);

    // 
    function createProxy_extend(subject) {
        const originMethod = subject.foo;
        subject.foo = () => (originMethod.call(this) + ' world!');
        return subject;
    }
}

// --- 17.4 Журналирование обращений к потоку для записи

// 
function proxy_logging_writable_stream() {
    console.log(`
        --- --- --- proxy_logging_writable_stream --- --- ---
    `);

    // 
    const writable = fs.createWriteStream(filename174);
    const writableProxy = createLoggingWritable(writable);

    // 
    writableProxy.write('First chunk\n');
    writableProxy.write('Second chunk\n');
    writable.write('Third chunk\n');
    writableProxy.end();

    // фабрика, возвращающая прокси потока для записи
    function createLoggingWritable(writableOrig) {

        // сохранение цепочки прототипов
        const proto = Object.getPrototypeOf(writableOrig);
        function LoggingWritable(writableOrig) {
            this.writableOrig = writableOrig;
        }
        LoggingWritable.prototype = Object.create(proto);

        // перехват метода write, при каждом вызове метода write пишется 
        //      сообщение в консоль, как и при завершении асинхронной операции
        LoggingWritable.prototype.write = function (chunk, encoding, callback) {

            // в прокси асинхронных функций требуется подменять функции обратного вызова
            if (!callback && typeof encoding === 'function') {
                callback = encoding;
                encoding = undefined;
            }

            // 
            console.log(`--- writing start: ${chunk}`);
            return this.writableOrig.write(`transform ---> ${chunk}`, encoding, function () {

                // 
                console.log(`--- writing end: ${chunk}`);
                callback && callback();
            });
        };

        // делегирование
        LoggingWritable.prototype.on = function () {
            return this.writableOrig.on.apply(this.writableOrig, arguments);
        };
        LoggingWritable.prototype.end = function () {
            return this.writableOrig.end.apply(this.writableOrig, arguments);
        };
        return new LoggingWritable(writableOrig);
    }
}

// --- 17.5 Прокси в стандарте ES2015

// Конструктор Proxy принимает аргументы target и handler:
//      const proxy = new Proxy(target, handler)
// где, 
//      target - это целевой объект (субъект), к которому применяется прокси;
//      handler - специальный объект, определяющий модель поведения прокси.
//          Содержит ряд необязательных методов с предопределенными именами,
//          называемых методами-ловушками, которые вызываются автоматически 
//          при выполнении соответствующих операций над субъектом.

// О программном интерфейсе Proxy: 
//      https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Proxy
//      https://developers.google.com/web/updates/2016/02/es2015-proxies

//
function proxy_es2015() {
    console.log(`
        --- --- --- proxy_es2015 --- --- ---
    `);

    // программный интерфейс Proxy тесно интегрирован в язык JavaScript и позволяет 
    //      перехватывать и настраивать множество операций, выполняемых над объектами
    const upperCase = new Proxy(
        // проксируемый объект
        { foo: 'foo', bar: 'bar', baz: 'baz' },
        {
            // перехват доступа к любому атрибуту объекта target
            get: (target, property) => {
                return target[property].toUpperCase();
            }
        }
    );
    console.log(`--- uppercase proxy: ${upperCase.foo} ${upperCase.bar} ${upperCase.baz}`);

    // прокси имитирует виртуальный массив всех четных чисел, он не содержит
    //      реальных данных и работать с ним следует как с обычным массивом
    const evenNumbers = new Proxy(
        // в качестве target этот прокси использует пустой массив и определяет 
        //      ловушки для get и has
        [],
        {
            // перехватывает обращения к элементам массива
            get: (target, index) => index * 2,
            // ловушка has перехватывает вызов оператора in
            has: (target, number) => number % 2 === 0
        }
    );
    console.log(`--- Цифра 2 чётная? --- ${2 in evenNumbers}`);                 // true
    console.log(`--- Цифра 5 чётная? --- ${5 in evenNumbers}`);                 // false
    console.log(`--- Седьмое по счету чётное число. --- ${evenNumbers[7]}`);    // 14
}

// --- 17.6 Реальное применение.

// Прокси могут использоваться в следующих задачах:
// - валидация данных перед отправкой их субъекту;
// - авторизация и аутентификация пользователей для доступа к операциям;
// - кэширование данных субъекта;
// - отложенная инициализация субъекта, потребляющего много ресурсов до момента использования;
// - логирование вызовов методов;
// - обращение к удаленным объектам как к локальным.

// Mongoose - библиотека объектно-документного отображения (Object­Document Mapping, ODM) 
//      для MongoDB. Использует пакет hooks для перехвата методов.
//      https://mongoosejs.com/docs/middleware.html

// Прокси используется в АОП (аспектно-ориентированнок программирование) для 
//      для перехвата управления до или после вызова метода, чтобы выполнить 
//      свой код в соответствующий момент. Это называется ловушками для функций.

// Прокси можно рассматривать как промежуточное программное обеспечение, так как 
//      прокси выполняет предварительную и заключительную обработку функций.

// hooks 
//      https://npmjs.org/package/hooks

// hooker 
//      https://npmjs.org/package/hooker 

// meld 
//      https://npmjs.org/package/meld

// --- Запуск.

// 
(async () => {

    // 
    await mkdirs(basepath, dirnames);

    // 
    objects_composition();
    object_literal_and_factory();
    object_extension();
    proxy_logging_writable_stream();
    proxy_es2015();
})();