"use strict";

const path = require('path');
const fromArray = require('from2-array');
const through = require('through2');
const fs = require('fs');
const stream = require('stream');
const split = require('split');
const request = require('request');
const throughParallel = require('through2-parallel');

//
const file1 = path.join(__dirname, './../Source/1.txt');
const file2 = path.join(__dirname, './../Source/2.txt');
const file3 = path.join(__dirname, './../Source/3.txt');
const filepath131 = path.join(__dirname, './../dist/13');
const urlsfile = path.join(__dirname, './../Source/urls.txt');
const filepath132 = path.join(__dirname, './../dist/13/results_132.txt');
const filepath133 = path.join(__dirname, './../dist/13/results_133.txt');
const filepath134 = path.join(__dirname, './../dist/13/results_134.txt');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['13'];



// --------------- 13. Управление асинхронным выполнением с помощью потоков.

// through2 
//      https://npmjs.org/package/through2 

// from2
//      https://npmjs.org/package/from2

// Оба паката основанны на версии интерфейса потоков Streams1. 

// Пакет through2 позволяет создать преобразующие потоки: 
//      const transform = through2([options], [_transform], [_flush])

// Пакет from2 позволяет создавать потоки для чтения:
//      const readable = from2([options], _read)

// --- 13.1 Последовательное выполнение.

// Шаблон - использование потока данных или их комбинации упрощает 
//      последовательное выполнение набора асинхронных заданий.

// 
async function streams_sequential_execution() {
    console.log(`
        --- --- --- streams_sequential_execution --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // запуск
        //      node concat allTogether.txt file1.txt file2.txt
        //      concatFiles(process.argv[2], process.argv.slice(3), ... );

        // 
        concatFiles(
            path.join(filepath131, 'allTogether.txt'),
            [file1, file2, file3],
            () => {
                console.log('--- complete');
                resolve();
            }
        );

        //
        function concatFiles(destination, files, callback) {

            // 
            const destStream = fs.createWriteStream(destination);

            // 'from2-array' создает из массива files поток для чтения
            fromArray.obj(files)
                .pipe(
                    // создается преобразующий поток through для последовательной 
                    //      обработки файлов
                    through.obj((file, enc, done) => {

                        // функция _transform() преобразующего потока не перейдет к
                        //      обработке следующего фрагмента пока не будет вызвана
                        //      функция callback, это требуется для обработки фрагментов 
                        //      в нужном порядке, но может использоваться для управления
                        //      потоком выполнения

                        // для каждого файла создается поток для чтения, который 
                        //      подключается к destStream
                        const src = fs.createReadStream(file);
                        src.pipe(destStream, { end: false });

                        // запись дополнительных данных между операциями
                        destStream.write('\n --- --- --- --- --- --- --- \n');

                        // после записи файла в destStream вызывается функция done, 
                        //      переданная в through.obj как обработчик завершения записи, 
                        //      которая выполняет переход к следующему файлу
                        src.on('end', done);
                    })
                )
                // после завершения обработки всех файлов генерируется событие finish
                .on('finish', () => {

                    // поток destStream закрывается
                    destStream.end();

                    // через вызов callback оповещаем о завершении операции
                    callback();
                });
        }

    });
}

// --- 13.2 Неупорядоченное не ограниченное параллельное выполнение. 

// split
//      https://npmjs.org/package/split

// Этот шаблон применяется только когда фрагменты данных не связаны между собой, что 
//      часто часто встречается при работе с объектными потоками данных и редко при
//      использовании двоичных потоков

// Предупреждение: потоки данных нельзя использовать для параллельной обработки, 
//      когда важен порядок следования фрагментов.

// При использовании этого алгоритма следует учитывать, что порядок обработки
//      элементов не сохраняется. Асинхронные операции могут закончить обработку
//      в любой момент. Это делает его непригодным для работы с двоичными потоками, 
//      где важен порядок данных, но подходит для объектных потоков.
class ParallelStream extends stream.Transform {
    constructor(userTransform) {
        super({ objectMode: true });
        this.userTransform = userTransform;
        this.running = 0;
        this.terminateCallback = null;
    }

    _transform(chunk, enc, done) {
        this.running++;

        // вызов done сразу после функции userTransform означает, что _transform 
        //      выполняется немедленно, userTransform получает специальную функцию 
        //      обратного вызова _onComplete, которая оповещает о завершении 
        //      userTransform
        this.userTransform(chunk, enc, this._onComplete.bind(this), this.push.bind(this));
        done();
    }

    // _flush вызывается перед завершением потока, в котором мы откладываем генерацию 
    //      события finish, отказываясь от вызова функции done и присваивая ее 
    //      terminateCallback
    _flush(done) {
        if (this.running > 0) {
            this.terminateCallback = done;
        }
        else {
            done();
        }
    }

    // этот метод вызывается после завершения каждого асинхронного задания
    _onComplete(err) {

        // 
        this.running--;
        if (err) {
            return this.emit('error', err);
        }

        // проверка счетчика заданий и вызов terminateCallback, которая является 
        //      функцией done, этот вызов завершит поток, сгенерировав событие finish
        if (this.running === 0) {
            this.terminateCallback && this.terminateCallback();
        }
    }
}

//
async function streams_unordered_parallel_execution(urlListFile) {
    console.log(`
        --- --- --- streams_unordered_parallel_execution --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // запустить модуль checkUrls следующей командой:
        //      node checkUrls urlList.txt
        //      streams_unordered_parallel_execution(process.argv[2]);

        // из входного файла создается поток для чтения
        fs.createReadStream(urlsfile)
            // содержимое файла обрабатывается функцией split - поток Transform, 
            //      который выделяет каждую строку в отдельный фрагмент
            .pipe(split())
            // ParallelStream используется для проверки URL ­адреса
            .pipe(new ParallelStream((url, enc, done, push) => {
                if (!url) {
                    return done();
                }

                // метод head отправляет запрос и ожидает ответа
                request.head(url, (err, response) => {

                    // функция обратного вызова передает результат операции в поток
                    push((err ? '--------: ' : 'рабочий: ') + url + '\n');
                    done();
                });
            }))
            // все результаты поступают по конвейеру в файл results.txt
            .pipe(fs.createWriteStream(filepath132))
            .on('finish', () => {
                console.log('--- complete');
                resolve();
            });
    });
}

// --- 13.3 Неупорядоченное ограниченное параллельное выполнение.

// Неограниченное параллельное выполнение может создать неконтролируемое количество 
//      соединений, отправив параллельно значительное количество данных, что способно 
//      вызвать нестабильность приложения и даже всей системы.

//
class LimitedParallelStream extends stream.Transform {
    constructor(concurrency, userTransform) {
        super({ objectMode: true });
        this.userTransform = userTransform;
        this.running = 0;
        this.terminateCallback = null;
        //
        this.concurrency = concurrency;
        this.continueCallback = null;
    }

    // 
    _transform(chunk, enc, done) {
        this.running++;
        this.userTransform(chunk, enc, this.push.bind(this), this._onComplete.bind(this));

        // проверяется количество выполняющихся заданий, прежде чем вызвать 
        //      done и перейти к обработке следующего элемента
        if (this.running < this.concurrency) {
            done();
        }
        else {
            // если достигнуто максимальное число обрабатываемых потоков, то 
            //      сохраняем функцию обратного вызова done, которая будет
            //      вызвана сразу после завершения задания
            this.continueCallback = done;
        }
    }

    //
    _flush(done) {
        if (this.running > 0) {
            this.terminateCallback = done;
        }
        else {
            done();
        }
    }

    // 
    _onComplete(err) {

        // 
        this.running--;
        if (err) {
            return this.emit('error', err);
        }

        // при завершении любого задания вызывается сохраненная функция done, 
        //      которая разблокирует поток данных и запускает обработку 
        //      следующего элемента
        const tmpCallback = this.continueCallback;
        this.continueCallback = null;
        tmpCallback && tmpCallback();

        // 
        if (this.running === 0) {
            this.terminateCallback && this.terminateCallback();
        }
    }
}

//
async function streams_unordered_limited_parallel_execution() {
    console.log(`
        --- --- --- streams_unordered_limited_parallel_execution --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        fs.createReadStream(urlsfile)
            .pipe(split())
            // значение concurrency передается в конструктор
            .pipe(new LimitedParallelStream(2, (url, enc, push, done) => {
                if (!url) return done();
                request.head(url, (err, response) => {
                    push((err ? '--------: ' : 'рабочий: ') + url + '\n');
                    done();
                });
            }))
            .pipe(fs.createWriteStream(filepath133))
            .on('finish', () => {
                console.log('--- complete');
                resolve();
            });
    });
}

// --- 13.4 Упорядоченное параллельное выполнение.

// through2-parallel 
//      https://npmjs.org/package/through2-parallel

// В некоторых ситуациях необходимо, чтобы все фрагменты выводились в порядке 
//      следования входных данных. 

async function streams_ordered_parallel_execution() {
    console.log(`
        --- --- --- streams_ordered_parallel_execution --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // асинхронные задания выполняются параллельно и могут завершаться в любом порядке,
        //      результаты параллельной обработки возвращаются в том же порядке, в каком 
        //      следуют URL ­адреса во входном файле
        fs.createReadStream(urlsfile)
            .pipe(split())
            .pipe(
                throughParallel.obj(
                    // 
                    { concurrency: 2 },
                    // 
                    function (url, enc, done) {
                        if (!url) return done();
                        request.head(url, (err, response) => {
                            this.push((err ? '--------: ' : 'рабочий: ') + url + '\n');
                            done();
                        });
                    }
                )
            )
            .pipe(fs.createWriteStream(filepath134))
            .on('finish', () => {
                console.log('--- complete');
                resolve();
            });
    });
}

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    // 
    await streams_sequential_execution();
    await streams_unordered_parallel_execution();
    await streams_unordered_limited_parallel_execution();
    await streams_ordered_parallel_execution();
})();