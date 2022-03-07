"use strict";

const stampit = require('stampit');

process.env.NODE_ENV = 'development';



// --------------- 15. Фабрика (Factory).

// --- 15.1 Универсальный интерфейс для создания объектов.

// Фабрика позволяет отделить создание объекта от его реализации, так что 
//      вызывающий коду может ничего не знать о порядке создания экземпляра. 
//      Создать новый экземпляр можно используя замыкания, прототип и оператор 
//      new, метод Object.create. Суть в том чтобы скрыть способ создания 
//      экземпляров и конкретные типы этих экземпляров.

// 
function factory_simple() {
    console.log(`
        --- --- --- factory_simple --- --- ---
    `);

    //
    function createImage(name) {
        // фабрику можно изменить, так что она будет возвращать экземпляры 
        //      новых типов, вызывающий код при этом не изменится
        //      return new Image(name);
        if (name.match(/\.jpe?g$/)) {
            return new ImageJpeg(name);
        } else if (name.match(/\.gif$/)) {
            return new ImageGif(name);
        } else if (name.match(/\.png$/)) {
            return new ImagePng(name);
        } else {
            throw new Exception('Unsupported format');
        }
    }

    // При использовании фабрики можно не экспортировать конструкторы создаваемых
    //      объектов, что исключает возможность их расширения и изменения, что 
    //      соответствует принципу 'малой общедоступной области'. Реализовать это
    //      можно путем экспорта только фабрики, оставив конструкторы закрытыми.
    class Image {
        constructor(path) {
            this.path = path;
        }
    };

    //
    class ImageGif extends Image {
        constructor(path) {
            if (!path.match(/\.gif/)) {
                throw new Error(`${path} is not a GIF image`);
            }
            super(path);
        }
        toString() {
            return '<ImageGif>';
        }
    };

    //
    class ImageJpeg extends Image {
        constructor(path) {
            if (!path.match(/\.jpe?g$/)) {
                throw new Error(`${path} is not a JPEG image`);
            }
            super(path);
        }
        toString() {
            return '<ImageJpeg>';
        }
    };

    //
    class ImagePng extends Image {
        constructor(path) {
            if (!path.match(/\.png$/)) {
                throw new Error(`${path} is not a PNG image`);
            }
            super(path);
        }
        toString() {
            return '<ImagePng>';
        }
    };

    // 
    const image1 = createImage('photo.jpg');
    const image2 = createImage('photo.gif');
    const image3 = createImage('photo.png');
    console.log(`--- image1 = ${image1}, image2 = ${image2}, image3 = ${image3}`);
}

// --- 15.2 Механизм принудительной инкапсуляции.

// Инкапсуляция – это способ управления доступом к деталям реализации объекта 
//      путем предотвращения непосредственного внесения изменений в объект извне. 
//      Взаимодействие с объектом осуществляется только через общий интерфейс, 
//      отделяющий внутреннюю реализацию объекта от внешнего кода.

// Модификаторы доступа в JavaScript отсутствуют и реализовать инкапсуляцию можно 
//      через области видимости функций и замыкания. Фабрики, в этом случае, 
//      упрощают поддержку закрытых переменных. 

// Другие способы создания закрытых свойств:
// - закрытые переменные в конструкторе (Douglas Crockford): 
//      http://crockford.com/javascript/private.html
// - использование соглашений, не исключающих доступа извне, например,
//      добавление символов префиксов '_' или '$' к переменным
// - коллекции WeakMap:
//      https://fitzgeraldnick.com/2014/01/13/hiding-implementation-details-with-e6-weakmaps.html
//      https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes/Private_class_fields

//
function factory_encapsulation() {
    console.log(`
        --- --- --- factory_encapsulation --- --- ---
    `);

    // 
    function createPerson(name) {

        // закрытые переменные
        const privateProperties = {};

        // объект person это открытый интерфейс, через замыкание объект person 
        //      получает доступ к закрытым переменным, эти переменные недоступны 
        //      вызывающему коду напрямую, поэтому объект person может гарантировать, 
        //      что name никогда не будет пустям
        const person = {
            setName: name => {
                if (!name) {
                    throw new Error('name invalid');
                }
                privateProperties.name = name;
            },
            getName: () => {
                return privateProperties.name;
            }
        };

        // 
        person.setName(name);
        return person;
    }

    //
    const person = createPerson('Foo Bar Baz');
    console.log(`
        --- Person:
        --- name = ${person.getName()}
        --- JSON(person) = ${JSON.stringify(person)}
    `);
}

// --- 15.3 Создание простого профилировщика кода.

// 
function factory_profiler() {
    console.log(`
        --- --- --- factory_profiler --- --- ---
    `);

    // 
    class Profiler {
        constructor(label) {
            this.label = label;
            this.lastTime = null;
        }

        // запускает сеанс профилирования
        start() {
            this.lastTime = process.hrtime();
        }

        // завершает сеанс профилирования и выводит время выполнения в консоль
        end() {
            const diff = process.hrtime(this.lastTime);
            console.log(`--- ${this.label}: ${diff[0]}sec - ${diff[1]}nsec`);
        }
    }

    // Запуск с профилированием:
    //      export NODE_ENV=development; node profilerTest
    // Запуск без профилирования:
    //      export NODE_ENV=production; node profilerTest

    // 
    getRandomArray(1e6);

    //
    function getRandomArray(len) {
        const profiler = createProfiler(`array[${len}]`);
        profiler.start();

        // полезная нагрузка
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(Math.random());
        }

        // 
        profiler.end();
    }

    // Благодаря динамической типизации можно возвращать объекты разных типов и 
    //      созданные разными способами, в том числе литерал объекта. Это позволяет 
    //      изолировать потребителя от всех подробностей создания объектов.

    // Утиная типизация:
    //      https://ru.wikipedia.org/wiki/Утиная_типизация

    // Фабрика позволяет абстрагироваться от создания объекта профилировщика в
    //      разных режимах работы
    function createProfiler(label) {
        // в режиме разработки возвращается полноценный объект профилировщика
        if (process.env.NODE_ENV === 'development') {
            return new Profiler(label);
        }
        // в режиме эксплуатации возвращается фиктивный объект с пустыми методами
        else if (process.env.NODE_ENV === 'production') {
            return { start: f => f, end: f => f };
        }
        else {
            throw new Error('NODE_ENV invalid');
        }
    };
}

// --- 15.4 Составные фабричные функции.

// stampit - создает фабричные функции с возможностью комбинирования методов и 
//      свойств содержащихся в генерируемых объектах:
//      https://www.npmjs.com/package/stampit

// Составные фабричные функции позволяют создавать объекты, способные перенимать и 
//      свойства из различных источников, без создания сложных иерархий классов.

// Статья Эрика Эллиота (Eric Elliot): 
//      https://medium.com/javascript-scene/introducing-the-stamp-specification-77f8911c2fee

// 
function factory_stampit() {
    console.log(`
        --- --- --- factory_stampit --- --- ---
    `);

    // 
    const showMethods = (st) => {
        return Object.getOwnPropertyNames(st).filter(
            (p) => typeof st[p] === 'function');
    }


    const logProps = (st) => `properties => ${JSON.stringify(st.compose.properties)}`;
    const logMethods = (st) => `methods => ${showMethods(st.compose.methods)}`;


    // составные свойства 
    const haveName = stampit().props({ name: 'anonymous' });
    console.log(`--- haveName 
        ${logProps(haveName)}`);


    // составные свойства 
    const haveCoords = stampit().props({ x: 0, y: 0 });
    console.log(`--- haveCoords 
        ${logProps(haveCoords)}`);


    // составная фабричная функция, compose указывает, что объект созданный
    //      при помощи конструктора character будет содержать свойства:
    //      [name, x, y]
    const character = stampit.compose(haveName, haveCoords)
        .props({ lifePoints: 100 });
    console.log(`--- character = haveName + haveCoords
        ${logProps(character)}`);


    // 
    const mover = stampit.compose(haveName, haveCoords)
        .methods({
            move(xIncr, yIncr) {
                this.x += xIncr;
                this.y += yIncr;
                console.log(`--- --- ${this.name} moved to [${this.x}, ${this.y}]`);
            },
            hit() {
                console.log(`--- --- ${this.name} hit`);
            }
        });
    console.log(`--- mover = haveName + haveCoords
        ${logProps(mover)}  
        ${logMethods(mover)}`);


    //
    const slasher = stampit.compose(haveName)
        .methods({
            slash(direction) {
                console.log(`--- --- ${this.name} slashed to ${direction}`);
            }
        });
    console.log(`--- slasher = haveName
        ${logProps(slasher)}  
        ${logMethods(slasher)}`);


    //
    const shooter = stampit()
        // важен порядок методов props и methods для здания свойства bullets
        .props({ bullets: 6 })
        .methods({
            shoot(direction) {
                if (this.bullets > 0) {
                    --this.bullets;
                    console.log(`--- --- ${this.name} shoot to ${direction}`);
                }
            }
        });
    console.log(`--- shooter
        ${logProps(shooter)}  
        ${logMethods(shooter)}`);


    //  Метод compose определяет новую составную фабричную функцию для создания 
    //      объектов, обладающих методами и свойствами, которые определяются
    //      фабричными функциями переданными в compose. Это позволяет оперировать 
    //      моделями поведения, а не классами.
    const runner = stampit.compose(character, mover);
    const samurai = stampit.compose(character, mover, slasher);
    const sniper = stampit.compose(character, shooter);
    const gunslinger = stampit.compose(character, mover, shooter);
    const westernSamurai = stampit.compose(gunslinger, samurai);


    // создать объект
    console.log(`--- --- --- --- gojiro --- --- --- ---`);
    const gojiro = westernSamurai();
    console.log(`gojiro: ${JSON.stringify(gojiro)}`);
    gojiro.name = 'Gojiro Kiryu';
    console.log(`gojiro: ${JSON.stringify(gojiro)}`);
    gojiro.move(1, 0);
    console.log(`gojiro: ${JSON.stringify(gojiro)}`);
    gojiro.slash('left');
    console.log(`gojiro: ${JSON.stringify(gojiro)}`);
    gojiro.shoot('right');
    console.log(`gojiro: ${JSON.stringify(gojiro)}`);
}

// --- 15.5 Реальное применение.

// Dnode - система вызова удаленных процедур (Remote Procedure Call, RPC)
//      https://npmjs.org/package/dnode
// Исходный код 
//      https://github.com/substack/dnode/blob/34d1c9aa9696f13bdf8fb99d9d039367ad873f90/index.js#L7-9

// Restify - фреймворк для реализации REST, использует фабрику для создания экземпляров сервера
//      https://npmjs.org/package/restify
// Исходный код 
//      https://github.com/restify/node-restify/blob/5f31e2334b38361ac7ac1a5e5d852b7206ef7d94/lib/index.js#L91-116

// http-proxy - библиотека создания программируемых прокси ­серверов
//      https://npmjs.org/package/http-proxy 

// bunyan - библиотека журналирования, использует фабрику для создания логгеров
//      https://npmjs.org/package/bunyan

// react-stampit - использует фабричные функции для создания виджетов
//      https://www.npmjs.com/package/react-stampit

// remitter - модуль обмена сообщениями на основе Redis
//      https://www.npmjs.com/package/remitter

// --- Запуск.

factory_simple();
factory_encapsulation();
factory_profiler();
factory_stampit();