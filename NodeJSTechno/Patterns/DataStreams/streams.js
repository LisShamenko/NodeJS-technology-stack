"use strict";

const path = require('path');
const fs = require('fs');
const http = require('http');
const mkdirp = require('mkdirp');
const stream = require('stream');
const Chance = require('chance');

// chance - позволяет генерировать все виды случайных значений
//      https://npmjs.org/package/chance
const chance = new Chance();
const filepath125 = path.join(__dirname, './../dist/125');
const filepath128 = path.join(__dirname, './../dist/128');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['128'];


// --------------- 12. Работа с потоками данных.

// В модуле stream доступно четыре базовых абстрактных класса для реализации 
//      потоков: stream.Readable, stream.Writable, stream.Duplex, stream.Transform.
//      Эти классы являются экземплярами EventEmitter и способны генерировать
//      ряд событий, например, end при завершении чтения или error при ошибке.

// Потоки поддерживают два режима работы:
// - двоичный режим используется для потоковой передачи данных в виде фрагментов;
// - объектный режим используется для передачи через поток дискретных объектов;

// --- 12.1 Поток для чтения. 

// Поток для чтения - это источник данных, реализуется через класс Readable. 
//      Существует два режима чтения из такого потока: дискретный и непрерывный.

// Дискретный режим. Заключается в считывании данных блоками (чанками - chunk).
//      Данные извлекаются из потока по требованию через метод read. Это метод
//      является синхронной операцией. Он извлекает блоки данных из буфера потока и 
//      возвращает объект Buffer или null, если данных в буфере нет. В двоичном 
//      режиме можно считывать строки вызывая метод setEncoding с допустимым 
//      форматом кодировки (например, utf8). Можно определить требуемый объем данных,
//      если передать в read значение size, что полезно при реализации сетевых 
//      протоколов или парсинге данных в специфичных форматах.

//
async function streams_flowing_discrete() {
    console.log(`
        --- --- --- streams_flowing_discrete --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // 
        const currentStream = new RandomStream(); // process.stdin // 
        currentStream
            // событие 'readable' уведомляет о наличии новых данных, готовых для чтения
            .on('readable', () => {
                let chunk;
                console.log(`--- readable`);

                // - в цикле выполняется чтение данных, пока не опустошится внутренний буфер
                // - метод read выполняет синхронное чтение из буфера и возвращает фрагмент 
                //      данных, это объект Buffer или String
                while ((chunk = currentStream.read()) !== null) {
                    console.log(`--- new chunk: ${chunk.toString()}`);
                }
            })
            // событие 'end' оповещает об окончании потока
            .on('end', () => {
                console.log(`--- end`); // process.stdout.write(`--- end`); // 
                resolve();
            });
    });
}

// Непрерывный режим. Заключается в подключении обработчика к событию 'data'. Данные 
//      не извлекаются методом read, а передаются обработчику сразу после их поступления.
//      Этот режим унаследован от старой версии интерфейса потоков данных - Streams1.
//      В версии Streams2 этот режим перестал быть режимом по умолчанию. Для переключения
//      на него необходимо подключить обработчик события или явно вызвать метод resume.
//      Метод pause позволяет временно приостановить генерацию событий и данные будут
//      кэшироваться во внутреннем буфере потока. Вызов pause() не переключает поток 
//      обратно в дискретный режим.

// 
async function streams_flowing_continuous() {
    console.log(`
        --- --- --- streams_flowing_continuous --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // 
        const currentStream = new RandomStream(); // process.stdin // 
        currentStream
            // 
            .on('data', chunk => {
                console.log(`--- data`);
                console.log(`--- new chunk: ${chunk.toString()}`);
            })
            // 
            .on('end', () => {
                console.log(`--- end`); // process.stdout.write(`--- end`); // 
                resolve();
            });
    });
}

// --- 12.2 Реализация потока для чтения.

// 
class RandomStream extends stream.Readable {

    // Новый класс потока наследуется от stream.Readable и должен включать реализацию 
    //      метода _read(size), который вызывается внутри класса Readable. Этот метод
    //      заполняет внутренний буфер потока при помощи метода push(chunk).

    // encoding         для преобразования значений из Buffer в String, по умолчанию null
    // objectMode       true - включает объектный режим, по умолчанию false
    // highWaterMark    верхнее ограничение объема данных в буфере, при достижении которого
    //                      прекращается чтение из источника, по умолчанию 16 КБ

    // 
    constructor(options) {
        super(options);
    }

    // эта реализация игнорирует аргумент size, так как он носит 
    //      рекомендательный характер, _read реализуется подклассом и 
    //      никогда не должен вызываться напрямую
    _read(size) {

        // создает случайную строку с помощью chance          
        const chunk = chance.string();
        console.log(`--- Pushing chunk of size: ${chunk.length}`);

        // можно добавить проверку метода push, если он вернет false, то будет 
        //      достигнуто ограничение highWaterMark и следует завершить 
        //      отправку данных в поток

        // помещает строку во внутренний буфер и указывает кодировку utf8, 
        //      при сохранении двоичных значений кодировку указывать не нужно
        this.push(chunk, 'utf8');

        // завершает поток с вероятностью 5%, значение null указывает конец потока (EOF)
        if (chance.bool({ likelihood: 5 })) {
            this.push(null);
        }
    }
}

// запуск
async function streams_readable() {
    console.log(`
        --- --- --- streams_readable --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // 
        const randomStream = new RandomStream();
        randomStream
            .on('readable', () => {
                let chunk;
                while ((chunk = randomStream.read()) !== null) {
                    console.log(`--- new chunk: ${chunk.toString()}`);
                }
            })
            .on('end', () => {
                console.log(`--- end`);
                resolve();
            });
    });
}

// --- 12.3 Потоки данных для записи.

// http.request
//      https://nodejs.org/api/http.html#httprequesturl-options-callback

// клиент
async function streamClient() {

    // 
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/',
        method: 'GET',
        headers: {}
    };

    // 
    return new Promise((resolve, reject) => {
        try {

            // запрос
            const req = http.request(options, res => {

                // 
                res.on('data', (chunk) => {
                    let str = chunk.toString();
                    console.log(`
                        --- CLIENT: ${(str.length > 50) ? str.slice(0, 50) : str}
                    `);
                });

                // 
                res.on('end', () => {
                    console.log(`--- CLIENT: end`);
                    resolve(); console.log('No more data in response.');
                });
            });

            // 
            req.on('error', (err) => {
                console.log(`--- CLIENT: request error = ${err}`);
            });

            // 
            req.end();
        }
        catch (err) {
            console.log(`--- err: ${err}`);
            reject(err);
        }
    });
}

// Поток для записи – это приемник данных, реализуется через класс Writable.

// 
async function streams_writable() {
    console.log(`
        --- --- --- streams_writable --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // Метод write передает данные в поток для записи:
        //      write(chunk, [encoding], [callback])
        //      - encoding указывается, если chunk это строка, иначе игнорируется, 
        //          по умолчанию utf8
        //      - callback вызывается после передачи данных в целевой ресурс

        // Метод end позволяет передать последний фрагмент данных:
        //      end([chunk], [encoding], [callback])
        //      - callback вызывается после передачи всех записанных данных в целевой 
        //          ресурс, аналогично событию 'finish'

        // 
        const server = http.createServer(
            (req, res) => {

                console.log(`--- SERVER`);

                // HTTP­ сервер записывает строки в объект res, который является 
                //      экземпляром класса http.ServerResponse и потоком для записи

                // записывается HTTP­ заголовок ответа, метод writeHead предоставляется 
                //      классом http.ServerResponse
                res.writeHead(200, { 'Content-Type': 'text/plain' });

                // цикл завершается с вероятностью 5%
                while (chance.bool({ likelihood: 95 })) {

                    // записывает в поток случайную строку
                    let mes = chance.string() + '\n';
                    res.write(mes);
                    console.log(`--- SERVER: ${mes}`);
                }

                // метод end оповещает поток об окончании записи данных и 
                //      отправлет последнюю строку данных
                res.end('end');

                // событие 'finish' генерируется после передачи всех данных в сокет
                res.on('finish', () => console.log('--- SERVER: finish'));

            }
        ).listen(
            8080,
            () => {
                // для проверки: curl localhost:8080
                console.log('--- SERVER: http://localhost:8080')
                resolve(server);
            }
        );
    });
}

// --- 12.4 Обратное давление.

// Обратное давление - это механизм позволяющий синхронизировать запись данных 
//      в поток и передачу данных из потока. Внутренний буфер потока позволяет
//      частично решить эту проблему, накапливая данные, которые поток не успевает
//      отправлять, но это может привести к нежелательным затратам памяти.
//      Свойство highWaterMark ограничивает размер внутреннего буфера. При
//      достижения этого размера метод write возвращет false, указывая коду,
//      что запись данных следует приостановить до момента когда буфер опустеет.
//      В этот момент генерируется событие 'drain', оповещающее о возможности 
//      продолжить запись.

// 
async function streams_writable_back_pressure() {
    console.log(`
        --- --- --- streams_writable_back_pressure --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // 
        const server = http.createServer(
            (req, res) => {

                // 
                res.writeHead(200, { 'Content-Type': 'text/plain' });

                // 
                sendData();

                // основная логика
                function sendData() {

                    console.log('--- SERVER: call sendData')

                    // 
                    while (chance.bool({ likelihood: 95 })) {

                        // чтобы повысить вероятность появления эффекта обратного давления, 
                        //      размер фрагмента данных был увеличен до (16кБ - 1Б),
                        //      ограничению highWaterMark равно 16кБ по умолчанию
                        const shouldContinue = res.write(
                            chance.string({ length: (16 * 1024) - 1 })
                        );

                        // если write возвращает false, то внутренний буфер полон и следует 
                        //      прекратить отправку данных, для этого выполняется выход из
                        //      функции и ставится одноразовый обработчик события 'drain' для
                        //      возобновления записи
                        if (!shouldContinue) {
                            console.log('--- SERVER: back pressure');
                            return res.once('drain', sendData);
                        }
                    }

                    // 
                    res.end('end', () => console.log('--- SERVER: finish'));
                }
            }
        ).listen(
            8080,
            () => {
                console.log('--- SERVER: http://localhost:8080');
                resolve(server);
            }
        );
    });
}

// --- 12.5 Реализация потоков для записи.

// класс потока для записи должен унаследовать класс stream.Writable и 
//      реализовать метод _write
class ToFileStream extends stream.Writable {

    //
    constructor() {

        // highWaterMark    ограничивает размер буфера, по умолчанию 16 КБ
        // decodeStrings    в двоичном режиме включает автоматическое декодирование 
        //                  строк перед передачей в метод _write, игнорируется 
        //                  в объектном режиме, по умолчанию true

        // 'objectMode:true' указывает, что поток будет работать в объектном режиме,
        //      входными данными этого потока являются объекты
        super({
            objectMode: true
        });
    }

    // Реализация метода _write, этот метод принимает фрагмент данных, в двоичном 
    //      режиме данные можно кодировать, если установить decodeStrings в false.
    //      Функция callback будет вызвана после завершения операции, если передать
    //      в нее ошибку, то поток сгенерирует событие 'error'.
    _write(chunk, encoding, callback) {

        // создать каталоги
        mkdirp(path.dirname(chunk.path), err => {
            if (err) {
                console.log(`--- err: ${err}`);
                return callback(err);
            }

            // создать файл с контентом
            fs.writeFile(chunk.path, chunk.content, callback);
        });
    }
}

// 
async function streams_writable_implement() {
    console.log(`
        --- --- --- streams_writable_implement --- --- ---
    `);
    return new Promise((resolve, reject) => {

        //
        const getRandomString = () => {
            let length = chance.integer({ min: 0, max: 100 });
            return chance.string({ length: length });
        }

        // 
        const tfs = new ToFileStream();
        tfs.write({ path: path.join(filepath125, 'foo.txt'), content: getRandomString() });
        tfs.write({ path: path.join(filepath125, 'bar.txt'), content: getRandomString() });
        tfs.write({ path: path.join(filepath125, 'baz.txt'), content: getRandomString() });
        tfs.end(() => {
            console.log("--- complete");
            resolve();
        });
    });
}

// --- 12.6 Дуплексные потоки данных.

// Дуплексный поток – это поток, поддерживающий чтение и запись. 

// При реализации класс потока наследуется от stream.Readable и stream.Writable, что 
//      позволяет использовать методы read/write и события 'readable'/'drain'. Необходимо 
//      реализовать методы _read/_write. Можно использовать дополнительный параметр:
//      allowHalfOpen - false вызовет завершение работы как чтения, так и записи, если
//          что то одно будет завершено, по умолчанию true.

// Объектный и двоичный режимы дуплексного потока для чтения и записи настраиваются
//      в конструкторе потока при помощи свойств:
//      this._writableState.objectMode
//      this._readableState.objectMode

// --- 12.7 Преобразующие потоки данных.


// Преобразующие потоки – это специальный вид дуплексных потоков, предназначенный для 
//      преобразования данных. Такой поток преобразует каждый фрагмент записываемых 
//      данных и отправляет на чтение. В обычном дуплексном потоке нет связи между 
//      записью и чтением данных. 

// Поток stream.PassThrough - это еще один вид потоков, похож на преобразующий 
//      поток, который выводит фрагменты данных без преобразований. Не является 
//      абстрактным.

//
class ReplaceStream extends stream.Transform {

    // новый преобразующий класс наследуется от stream.Transform,
    //      - searchString      искомый текст
    //      - replaceString     строка замены
    constructor(searchString, replaceString) {
        super();
        this.searchString = searchString;
        this.replaceString = replaceString;
        this.tailPiece = '';
    }

    // метод '_transform' помещает данные во внутренний буфер при помощи метода push,
    //      имеет ту же сигнатуру, что и метод _write
    _transform(chunk, encoding, callback) {

        // алгоритм разбивает фрагменты, используя searchString в качестве разделителя
        const pieces = (this.tailPiece + chunk).split(this.searchString);
        const lastPiece = pieces[pieces.length - 1];
        const tailPieceLen = this.searchString.length - 1;

        // извлекает несколько символов из последнего элемента массива и добавляет 
        //      перед следующим фрагментом данных
        this.tailPiece = lastPiece.slice(-tailPieceLen);
        pieces[pieces.length - 1] = lastPiece.slice(0, -tailPieceLen);

        // все фрагменты объединяются с использованием разделителя replaceString и 
        //      помещаются во внутренний буфер
        this.push(pieces.join(this.replaceString));
        callback();
    }

    // метод '_flush' выполняет ряд заключительных операций и завершает работу класса 
    //      ReplaceStream, метод принимает функцию обратного вызова, которая вызывается 
    //      после выполнения всех завершающих операций
    _flush(callback) {

        // если в переменной tailPiece остались данные не переданные в буфер, то 
        //      завершающую передачу можно сделать в этом методе
        this.push(this.tailPiece);
        callback();
    }
}

// 
async function streams_transform() {
    console.log(`
        --- --- --- streams_transform --- --- ---
    `);
    return new Promise((resolve, reject) => {

        // 
        const replaceStream = new ReplaceStream('World', 'Node.js');
        replaceStream
            .on('data', chunk => {
                console.log(`--- new chunk: ${chunk.toString()}`);
            })
            .on('end', () => {
                console.log(`--- complete`);
                resolve();
            });

        // 
        replaceStream.write('Hello W');
        replaceStream.write('orld!');
        replaceStream.end();
    });
}

// --- 12.8 Конвейер потоков.

// Идея конвейера была введена в Unix Дугласом Маклороем (Douglas Mcllroy). Конвейер 
//      позволяет связать вывод одной программы с вводом другой. Примеры:
// 
//      echo Hello World! | node replace World Node.js
//      echo Hello World! | sed s/World/Node.js/g
//      Где символ '|' - это оператор конвейера.
// 
//      Команда echo запишет строку 'Hello World!' в стандартный вывод, который будет 
//      перенаправлен в стандартный ввод команды sed, а затем команда sed заменит все 
//      слова World на Node.js и выведет результат в свой стандартный вывод (консоль).

// Потоки можно комбинировать при помощи метода pipe, который извлекает данные из 
//      потока readable и записывает их в поток writeable. Затем метод возвращает
//      переданный ему поток writeable, что позволяет создавать цепочки из дуплексных и 
//      преобразующих потоков. 
// 
//      readable.pipe(writable, [options])

// Поток writeable автоматически завершается, когда поток readable сгенерирует событие 
//      'end', но это работает, если в конструкторе не передать параметр 'end:false'. 

// При соединение потоков данные автоматически претекают в поток writeable и не требуется
//      вызывать методы read или write. Обратное давление то же регулируется автоматически.

// 
class ProcessStdin extends stream.Readable {
    constructor(options) {
        super(options);
        this.chunks = options.chunks;
    }
    _read(size) {
        this.chunks.forEach(chunk => {
            this.push(chunk, 'utf8');
        });
        this.push(null);
    }
}

// 
class ProcessStdout extends stream.Writable {
    constructor(options) {
        super({ objectMode: true });
        this.path = options.path;
        this.id = options.id;
    }

    // последовательность добавления в файл 
    //
    //      fs.open(this.path, 'w', function (err, id) {
    //          fs.write(id, chunk.toString(), null, 'utf8', function () {
    //              fs.close(id, function () {
    //                  console.log('--- file update');
    //              });
    //          });
    //      });

    // асинхронная инициализация
    //      https://nodejs.org/api/stream.html#writable_constructcallback
    //
    //      _construct(callback) {
    //          fs.open(this.path, 'w', (err, id) => {
    //              if (err) {
    //                  return callback(err);
    //              }
    //      
    //              // 
    //              this.id = id;
    //              callback();
    //          });
    //      }

    _write(chunk, encoding, callback) {
        if (this.id) {
            fs.write(this.id, chunk.toString(), callback);
        }
    }

    _destroy(err, callback) {
        if (this.id) {
            fs.close(this.id, (close_err) => callback(close_err || err));
        }
        else {
            callback(err);
        }
    }
}

// 
async function openFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.open(filepath, 'a', (err, id) => {
            if (err) {
                return reject(err);
            }
            resolve(id);
        });
    });
}

// 
async function streams_pipeline() {
    console.log(`
        --- --- --- streams_pipeline --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // 
        const firstStream = new ReplaceStream('First', 'Angular');
        const secondStream = new ReplaceStream('Second', 'React');
        const processStdin = new ProcessStdin({
            chunks: ['First project', ' - ', 'Second project', '\n']
        });

        // 
        const filepath = path.join(filepath128, 'result.txt');
        const id = await openFile(filepath);
        const processStdout = new ProcessStdout({
            path: path.join(filepath128, 'result.txt'),
            id: id,
        });

        //
        processStdin // process.stdin // 
            .pipe(firstStream)
            .pipe(secondStream)
            // события 'error' не распространяются через конвейер автоматически, здесь будут
            //      перехвачены ошибки потока secondStream, так как обработчик подключается
            //      именно к этому потоку, для потока firstStream требуется свой обработчик
            .on('error', (err) => console.log(`--- err: ${err}`))
            .pipe(processStdout) // .pipe(process.stdout); //
            .on('end', () => {
                console.log(`--- end`);
                resolve();
            });
    });
}

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    await streams_flowing_discrete();
    await streams_flowing_continuous();
    await streams_readable();

    // 
    const server_writable = await streams_writable();
    await streamClient();
    server_writable.close();

    // 
    const server_back_pressure = await streams_writable_back_pressure();
    await streamClient();
    server_back_pressure.close();

    // server-destroy - средство остановки и удаления сервера
    //      https://www.npmjs.com/package/server-destroy
    // 
    //      var enableDestroy = require('server-destroy');
    //      var server = http.createServer(function (req, res) { ... });
    //      server.listen(PORT);
    //      // enhance with a 'destroy' function
    //      enableDestroy(server);
    //      // some time later...
    //      server.destroy();

    // 
    await streams_writable_implement();
    await streams_transform();
    await streams_pipeline();
})();