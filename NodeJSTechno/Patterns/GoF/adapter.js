"use strict";

const level = require('level');
const fs = require('fs');
const path = require('path');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['19'];

// 
const filepath191 = path.join(__dirname, './../dist/19');
const file191 = path.join(filepath191, 'rw.txt');
const levelpath191 = path.join(filepath191, 'db191');



// --------------- 19. Адаптер (adapter).

// Адаптер позволяет организовать доступ к функциональности объекта с помощью 
//      альтернативного интерфейса. Адаптер является оберткой для адаптируемого
//      объекта, предоставляя для него новый интерфейс. 

// level.js - позволяющие работать с базой данных в браузере
//      https://npmjs.org/package/level-js

// --- 19.1 Адаптер LevelUP-fs.

// оригинальный программный интерфейс fs
async function usingFS(fsref, file, logPrefix) {
    return new Promise((resolve, reject) => {

        let i = 0;
        const check = () => {
            if (i >= 3) resolve();
        }

        // 
        try {

            // несколько допустимых операций
            fsref.writeFile(file, 'Hello!', (err) => {
                if (err) {
                    i += 2;
                    console.log(`--- ${logPrefix} --- 1 --- err = ${err}`);
                    return check();
                }

                // 
                i++;
                fsref.readFile(file, { encoding: 'utf8' }, (err, res) => {
                    i++;
                    if (err) console.log(`--- ${logPrefix} --- 2 --- err = ${err}`);
                    else console.log(`--- ${logPrefix} --- 3 --- res = ${res}`);
                    return check();
                })
            });

            // попытка прочитать несуществующий файл
            fsref.readFile('missing.txt', { encoding: 'utf8' }, (err, res) => {
                i++;
                if (err) console.log(`--- ${logPrefix} --- 4 --- err = ${err}`);
                else console.log(`--- ${logPrefix} --- 5 --- res = ${res}`);
                return check();
            });
        }
        catch (err) {
            console.log(`--- ${logPrefix} --- 6 --- err = ${err}`);
        }
    });
}

// 
async function createLevelDB(dbpath, options) {
    return new Promise((resolve, reject) => {
        const db = level(dbpath, options);
        resolve(db);
    });
}

// адаптер транслирующий вызовы readFile/writeFile в db.get/db.put, позволяет
//      использовать базу данных LevelUP в качестве файлового хранилища,  
//      модуль level.js позволит делать тоже самое с браузером
function createFsAdapter(db) {
    return new Promise(async (resolve, reject) => {

        // 
        const fs = {};

        //
        fs.readFile = (filename, options, callback) => {

            // 
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }
            else if (typeof options === 'string') {
                options = { encoding: options };
            }

            // извлечение файла, в качестве ключа используется полный путь 
            //      к файлу (path.resolve), valueEncoding базы данных 
            //      устанавливается равным значению параметра options.encoding 
            //      функции readFile
            db.get(
                path.resolve(filename),
                {
                    valueEncoding: options.encoding
                },
                (err, value) => {

                    // адаптация ошибок
                    if (err) {
                        // если ключ отсутствует в базе данных, то генерируется 
                        //      ошибка отсутствия файла (ENOENT), которая 
                        //      используется оригиналом fs
                        if (err.type === 'NotFoundError') {
                            err = new Error(`ENOENT, open "${filename}"`);
                            err.code = 'ENOENT';
                            err.errno = 34;
                            err.path = filename;
                        }
                        return callback && callback(err);
                    }

                    // при успешном извлечении данных из базы значение передается 
                    //      вызвавшему объекту через функцию обратного вызова
                    callback && callback(null, value);
                }
            );
        };

        // 
        fs.writeFile = (filename, contents, options, callback) => {

            // 
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }
            else if (typeof options === 'string') {
                options = { encoding: options };
            }

            // 
            db.put(
                path.resolve(filename),
                contents,
                {
                    valueEncoding: options.encoding
                },
                callback
            );
        };

        // 
        resolve(fs);
    });
};

// 
async function create_fs_adapter() {
    console.log(`
        --- --- --- create_fs_adapter --- --- ---
    `);

    // оригинальный программный интерфейс fs
    await usingFS(fs, file191, 'origin fs');

    // создать базу данных
    const db = await createLevelDB(levelpath191, { valueEncoding: 'binary' });

    // создать адаптер fs->level
    const levelFS = await createFsAdapter(db);

    // вариант с адаптером
    await usingFS(levelFS, file191, 'level fs');
}

// --- 19.2 Реальное применение.

// адаптеры LevelUP
//      https://github.com/Level/awesome

// jugglingdb - многоцелевая ORM­ надстройка для работы с разными базами данных
//      https://github.com/1602/jugglingdb/tree/master/lib/adapters

// level-filesystem - полноценная LevelUP реализация программного интерфейса fs
//      https://www.npmjs.com/package/level-filesystem

// --- Запуск.

// 
(async () => {
    await mkdirs(basepath, dirnames);
    await create_fs_adapter();
})();