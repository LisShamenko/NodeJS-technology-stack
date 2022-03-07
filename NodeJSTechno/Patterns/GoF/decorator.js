"use strict";

// level - 
//      https://github.com/Level/level
const level = require('level');
const path = require('path');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['18'];

// 
const filepath183 = path.join(__dirname, './../dist/18');
const levelpath183 = path.join(filepath183, 'db183');



// --------------- 18. Декоратор (decorator).

// Декоратор - структурный шаблон, суть которого заключается в динамическом расширении 
//      модели поведения существующего объекта. Новые функциональные возможности
//      добавляются в экземпляр класса к котормоу применяется декоратор. Этот шаблон
//      отличается от прокси тем, что добавляет новые возможности, а не изменяет
//      существующие. 

// 
const terms = {
    foo: () => 'foo',
    bar: (prefix, postfix) => `${prefix}bar${postfix}`,
    baz: () => 'baz',
}

// --- 18.1 Композиция.

// компонент обертывается новым объектом, который наследует его, в декораторе 
//      определяются новые методы, а вызовы существующих делегируются оригиналу
function decorateComposition(component) {

    // 
    const proto = Object.getPrototypeOf(component);
    function Decorator(component) {
        this.component = component;
    }
    Decorator.prototype = Object.create(proto);

    // новый метод
    Decorator.prototype.foo = () => '--- FOO decor ---';

    // делегируемый метод
    Decorator.prototype.bar = function () {
        return this.component.bar.apply(this.component, arguments);
    };

    // 
    return new Decorator(component);
}

// 
function decorate_composition() {
    console.log(`
        --- --- --- composition_decorator --- --- ---
    `);

    // 
    try {
        const decoratedObject = decorateComposition(terms);
        console.log(`--- new method: ${decoratedObject.foo()}`);
        console.log(`--- original method: ${decoratedObject.bar('(_', '_)')}`);
        console.log(`--- error method:  ${decoratedObject.baz()}`);
    }
    catch (err) {
        console.log(`--- baz error: ${err.message}`);
    }
}

// --- 18.2 Расширение объекта.

// присоединяет новые методы непосредственно к декорируемому объекту
function decorateExtension(component) {
    component.foo = () => 'New foooooo!';
    return component;
}

// 
function decorate_extension() {
    console.log(`
        --- --- --- decorate_extension --- --- ---
    `);

    // 
    try {
        const decoratedObject = decorateExtension(terms);
        console.log(`--- new method: ${decoratedObject.foo()}`);
        console.log(`--- original method: ${decoratedObject.bar('(_', '_)')}`);
        console.log(`--- error method:  ${decoratedObject.baz()}`);
    }
    catch (err) {
        console.log(`--- baz error: ${err.message}`);
    }
}

// --- 18.3 Декорирование базы данных.

// level 
//      http://npmjs.org/package/level

// LevelUP - обертка для хранилища LevelDB, база данных LevelDB обеспечивает невероятно 
//      высокую производительность и только базовый набор функций, позволяя строить 
//      на ее основе практически любые базы данных.
//      https://npmjs.org/package/levelup
//      https://github.com/Level/levelup

// Доминик Тарр (Dominic Tarr) отзывается о LevelDB за ее минимализм и расширяемость, как 
//      о "платформе Node.js в мире баз данных".

// PouchDB - клон CouchDB
//      https://npmjs.org/package/pouchdb

// CouchUP 
//      https://npmjs.org/package/couchup

// levelgraph
//      https://npmjs.org/package/levelgraph

// 
async function createLevelDB(dbpath) {
    return new Promise((resolve, reject) => {

        // 1) Create our database, supply location and options.
        //    This will create or open the underlying store.
        const db = level(dbpath, { valueEncoding: 'json' });

        /// 
        db.on('put', function (key, value) {
            console.log('inserted', { key, value })
        })

        // 2) Put a key & value
        db.put('name', 'Level', function (err) {

            // some kind of I/O error
            if (err) {
                console.log(`--- Ooops! --- ${err.message}`);
                return reject(err);
            }

            // 3) Fetch by key
            db.get('name', function (err, value) {

                // likely the key was not found
                if (err) {
                    console.log(`--- Ooops! --- ${err.message}`);
                    return reject(err);
                }

                // Ta da!
                console.log(`--- set name = ${value}`);
                resolve(db);
            })
        })
    });
}

//
function levelSubscribe(db) {

    // объект db декорируется новым методом subscribe, расширение объекта
    db.subscribe = (pattern, listener) => {

        // обработка всех операций put с базой данных
        db.on('put', (key, val) => {

            // простой алгоритм проверки соответствия образцу, все свойства 
            //      в образце сопоставляются со свойствами в добавляемых данных
            const match = Object.keys(pattern).every(
                k => (pattern[k] === val[k])
            );

            // при обнаружении соответствия вызывается обработчик listener
            if (match) {
                listener(key, val);
            }
        });
    };
    return db;
};

// 
async function decorator_levelup_plugin() {
    console.log(`
        --- --- --- decorator_levelup_plugin --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        let levelDB = await createLevelDB(levelpath183);

        // выбираются каталог для хранения файлов и кодировка
        //      let db = level(__dirname + '/db', { valueEncoding: 'json' });

        // плагин присоединятся к декорируемому объекту db
        levelDB = levelSubscribe(levelDB);

        // вызов нового метода subscribe с искомым образцом, который соответствует
        //      объектам со значениями свойств: doctype = 'tweet' и language = 'en'
        levelDB.subscribe(
            { doctype: 'post', language: 'en' },
            (k, val) => {
                console.log(`--- subscribe --- value = ${JSON.stringify(val)}`);
            }
        );

        // нескольких значений сохраняются в базе данных с помощью метода put, 
        //      первый объект соответствует образцу, поэтому будет вызван обработчик, 
        //      второй объект образцу не соответсвует
        levelDB.put('1', { doctype: 'post', text: 'Ta da!', language: 'en' });
        levelDB.put('2', { doctype: 'user', name: 'la-la-la' });
        resolve();
    });
}

// --- 18.4 Реальное применение.

// level-inverted-index - добавляет поддержку инвертированных индексов в LevelUP, 
//      позволяет выполнять простой текстовый поиск значений, хранящихся в базе данных.
//      https://github.com/dominictarr/level-inverted-index

// level-plus - добавляет возможность атомарных обновлений в базе данных LevelUP
//      https://github.com/eugeneware/levelplus

// --- Запуск.

// 
(async () => {

    // 
    await mkdirs(basepath, dirnames);

    // 
    decorate_composition();
    decorate_extension();
    decorator_levelup_plugin();
})();