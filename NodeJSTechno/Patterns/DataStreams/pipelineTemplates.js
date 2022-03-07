"use strict";

const zlib = require('zlib');
const crypto = require('crypto');
const combine = require('multipipe');
const fs = require('fs');
const tar = require('tar-fs'); // const tar = require('tar-stream'); // require('tar'); // 
const fstream = require('fstream');
const path = require('path');
const child_process = require('child_process');
const net = require('net');

// 
const sourcefile1 = path.join(__dirname, './../Source/', '1.txt');
const sourcefile2 = path.join(__dirname, './../Source/', '2.txt');
const filepath142 = path.join(__dirname, './../dist/14');
const filepath143 = path.join(__dirname, './../dist/14');
const sourcedirA = path.join(__dirname, './../Source/A');
const sourcedirB = path.join(__dirname, './../Source/B');
const filepath144 = path.join(__dirname, './../dist/14');
const sourceCode = path.join(__dirname, './../Source/', 'code.js');
const filepath145 = path.join(__dirname, './../dist/14');


// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['14'];



// --------------- 14. Шаблоны конвейерной обработки.

// --- 14.1 Объединение потоков данных.

// duplexer2 
//      https://npmjs.org/package/duplexer2

// multipipe 
//      https://www.npmjs.org/package/multipipe

// combine-stream 
//      https://www.npmjs.org/package/combine-stream

// Объединенный поток обычно является дуплексным потоком. При записи в объединенный 
//      поток запись выполняется в первый поток. При чтении из объединенного потока
//      чтение выполняется из последнего потока. Объединенный поток можно представить 
//      как черный ящик, скрывающий реализацию конвейера, а так как отдельные потоки
//      скрыты внутри ящика, то обработчики ошибок не могут подключаться к отдельным
//      потокам.  

// Если рассматривать объединенный поток как черный ящик, то он должен выступать
//      в качестве концентратора всех ошибок, возникающих в любом из составляющих 
//      его потоков. Стоит учитывать, что событие error не распространяется по
//      конвейеру автоматически, а модель черного ящика исключает доступ к любому 
//      из потоков в середине конвейера.

// --- 14.2 Реализация объединенного потока данных.

// настройки шифрования
const keyBytes = crypto.scryptSync('a_shared_secret', 'salt', 32);
const ivBytes = crypto.randomBytes(16);

// сжимает и шифрует
function CompressEncrypt() {
    return combine(
        crypto.createCipheriv('aes256', keyBytes, ivBytes),
        zlib.createGzip()
    );
};
// 
async function applyCompressEncrypt(sourcefile, distfile) {
    await combine(
        fs.createReadStream(sourcefile)
            .pipe(CompressEncrypt())
            .pipe(fs.createWriteStream(distfile))
            // код перехватывает только ошибки последнего потока
            .on('error', err => {
                console.log(`--- Compress/Encrypt --- last stream error: ${err}`);
            })
    )
        // объединенный поток, код перехватывает ошибки всех потоков
        .on('error', err => {
            console.log(`--- Compress/Encrypt --- any streams errors: ${err}`);
        })
    console.log(`--- Compress/Encrypt --- complete`);
};

// расшифровывает и распаковывает
function DecryptDecompress() {
    return combine(
        zlib.createGunzip(),
        crypto.createDecipheriv('aes256', keyBytes, ivBytes)
    );
};
// 
async function applyDecryptDecompress(sourcefile, distfile) {
    await combine(
        fs.createReadStream(sourcefile)
            .pipe(DecryptDecompress())
            .pipe(fs.createWriteStream(distfile))
    )
        .on('error', err => {
            console.log(`--- Decrypt/Decompress --- any streams errors: ${err}`);
            reject(err);
        });
    console.log(`--- Decrypt/Decompress --- complete`);
};

// 
async function streams_combined() {
    console.log(`
        --- --- --- streams_combined --- --- ---
    `);

    // 
    const distzip = path.join(filepath142, 'distzip.gz');
    const distfile = path.join(filepath142, 'distfile.txt');
    await applyCompressEncrypt(sourcefile1, distzip);
    await applyDecryptDecompress(distzip, distfile);
}

// --- 14.3 Ветвление потоков данных.

// Один поток для чтения можно разделить на несколько потоков для записи, что 
//      позволяет применить разные преобразования к одним и тем же данным или 
//      разделить данные на основе определенных критериев.

// 
async function streams_fork() {
    console.log(`
        --- --- --- streams_fork --- --- ---
    `);

    // - потоки md5Stream и sha1Stream автоматически закроются при завершении 
    //      потока inputStream, если не передать в вызов pipe параметр 'end: false'
    // - обе ветки будут получать одни и те же данные, поэтому следует проявлять 
    //      осторожность при изменении данных, чтобы избежать побочных эффектов
    // - обратное давление здесь обрабатывается встроенными средствами, скорость 
    //      потока inputStream определяется скоростью самой медленной ветви

    // 
    const filesha1 = path.join(filepath143, 'result143.sha1');
    const sha1Stream = crypto.createHash('sha1');
    sha1Stream.setEncoding('base64');

    // 
    const filemd5 = path.join(filepath143, 'result143.md5');
    const md5Stream = crypto.createHash('md5');
    md5Stream.setEncoding('base64');

    // поток для чтения из файла направляется в два разных потока, результатом
    //      которых будут два файла, первый будет содержать хеш sha1, а второй 
    //      контрольную сумму md5
    const inputStream = fs.createReadStream(sourcefile1);

    // 
    await ((async () =>
        new Promise((resolve, reject) => {

            // 
            inputStream
                .pipe(sha1Stream)
                .pipe(fs.createWriteStream(filesha1))
                .on('error', (err) => {
                    console.log(`--- err: ${err}`);
                    reject(err);
                })
                .on('close', () => {
                    console.log(`--- sha1 stream complete`);
                    resolve();
                });
        })
    )());

    // 
    await ((async () =>
        new Promise((resolve, reject) => {

            //
            inputStream
                .pipe(md5Stream)
                .pipe(fs.createWriteStream(filemd5))
                .on('error', (err) => {
                    console.log(`--- err: ${err}`);
                    reject(err);
                })
                .on('close', () => {
                    console.log(`--- md5 stream complete`);
                    resolve();
                });
        })
    )());
}

// --- 14.4 Слияние потоков данных.

// tar - пакет для создания тарболлов (tar-архивов)
//      https://npmjs.org/package/tar 

// fstream - пакет для создания объектных потоков из файлов
//      https://npmjs.org/package/fstream 

// merge-stream 
//      https://npmjs.org/package/merge-stream

// multistream-merge 
//      https://npmjs.org/package/multistream-merge

// multistream 
//      https://npmjs.org/package/multistream

// При слиянии нескольких потоков в один следует учитывать, что значение auto в 
//      параметре end вызовет завершение потока-приемника при закрытии любого из 
//      потоков-источников, что приводит к ошибке, поскольку другие потоки  
//      продолжают писать в завершенный поток. Для решения проблемы следует 
//      использовать 'end: false' для всех потоков-источников и вызовом end должен
//      выполняться на потоке-приемнике только когда чтение из всех источников закончено.

// архивирование нескольких каталогов
async function streams_merge() {
    console.log(`
        --- --- --- streams_merge --- --- ---
    `);
    return new Promise(async (resolve, reject) => {

        // process.cwd()
        const destination = path.join(filepath144, 'result144.tar');

        // просто копировать файлы, 
        //      const destination = filepath144;
        //      const pack = fstream.Writer(destination);

        // создается поток tar и подсоединим его к приемнику
        const pack = tar.pack();
        pack.pipe(fstream.Writer(destination));

        // подсчет количество закрытых потоков и завершение 
        //      потока архиватора
        let endCount = 0, errorCount = 0;
        function onEnd() {
            console.log(`--- end operation`);
            endCount++;
            if ((endCount + errorCount) === 2) {
                pack.finalize();
                resolve({ endCount, errorCount });
            }
        }
        function onError(err) {
            console.log(`--- error operation: ${err}`);
            errorCount++;
            if ((endCount + errorCount) === 2) {
                pack.finalize();
                resolve({ endCount, errorCount });
            }
        }

        //
        const sourceA = sourcedirA; // path.join(sourcedirA, '4.txt'); // 
        const sourceB = sourcedirB; // path.join(sourcedirB, '5.txt'); // 

        // инициализируем входящие потоки
        const sourceStreamA = fstream
            .Reader({ type: "Directory", path: sourceA }) // (sourceA) // 
            .on('error', onError)
            .on('end', onEnd);

        // инициализируем входящие потоки
        const sourceStreamB = fstream
            .Reader({ type: "Directory", path: sourceB }) // (sourceB) // 
            .on('error', onError)
            .on('end', onEnd);

        // слияние потоков, в качестве источника выступает поток архиватора,
        //      отключается автоматическое завершение принимающего потока 
        //      передачей параметра 'end:false'
        sourceStreamA.pipe(pack, { end: false });
        sourceStreamB.pipe(pack, { end: false });
    });
}

// --- 14.5 Мультиплексирование и демультиплексирование.

// Шаблон 'мультиплексор/демультиплексор' - это организация общего канала вывода 
//      данных из нескольких потоков, в котором потоки-­источники остаются логически 
//      отделенными, что позволяет разделить потоки на выходе из общего канала.
//      Мультиплексирование (MUX) - это операция объединения нескольких потоков для
//      передачи данных по общему каналу. 
//      Демультиплексирование (DEMUX) - это операция восстановление оригинальных 
//      потоков из общего канала. 

// Коммутация пакетов - технология, которая обеспечивает помещение данных в пакеты, 
//      позволяя при этом определять различные метаданные, необходимые для маршрутизации, 
//      мультиплексирования, управления потоком, проверки данных на повреждения и т.д.
//      Пакет содержит идентификатор канала, длину данных и сами данные. Этого достаточно,
//      чтобы распределить данные по нужным потокам.

// принимает потоки­ источники для мультиплексирования и целевой канал, 
//      1 байт для идентификации канала позволяет мультиплексировать до 256 
//      различных потоков-источников
function multiplexChannels(sources, destination, callback) {

    // 
    let totalChannels = sources.length;

    // 
    for (let i = 0; i < sources.length; i++) {
        sources[i]
            // для каждого потока­-источника данные извлекаются в 
            //      обработчике события readable
            .on('readable', function () {

                // каждый фрагмент записывается в отдельный пакет
                let chunk;
                while ((chunk = this.read()) !== null) {

                    // запись данных в пакет, который содержит: 
                    // - 1Б (UInt8) идентификатор канала
                    // - 4Б (UInt32BE) размер пакета
                    // - фактические данные
                    const outBuff = new Buffer(1 + 4 + chunk.length);
                    outBuff.writeUInt8(i, 0);
                    outBuff.writeUInt32BE(chunk.length, 1);
                    chunk.copy(outBuff, 5);

                    // подготовленный пакет записывается в целевой поток
                    destination.write(outBuff);
                    console.log('--- отправка пакета --- channel: ' + i);
                }
            })
            // обработчик события end завершает целевой поток после 
            //      закрытия всех потоков ­источников
            .on('end', () => {
                if (--totalChannels === 0) {
                    destination.end();
                    console.log('--- все операции отправлены на сервер');
                    if (callback) {
                        callback();
                    }
                }
            });
    }
}

// Мультиплексирование на стороне клиента.
async function streams_mux(pathToChild, options, callback) {
    return new Promise(async (resolve, reject) => {

        // создается новое TCP­ подключение клиента к адресу 'localhost:3000'
        const socket = net.connect(3000, () => {

            // запуск дочернего процесса
            const child = child_process.fork(
                // путь к дочернему процессу
                pathToChild,
                // остальные аргументы
                options,
                // позволяет избежать наследования дочерним процессом stdout и 
                //      stderr родительского процесса
                { silent: true }
            );

            // клиент может запускать только другие модули NodeJS, child_process.fork:
            //      http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options

            socket.on('end', () => console.log('--- client socket end'));

            // stdout и stderr дочернего процесса мультиплексируются и 
            //      передаются в сокет
            console.log('--- 1');
            multiplexChannels([child.stdout, child.stderr], socket, callback);

            // 
            resolve({ socket, child });
        });
    });
}

//
function demultiplexChannel(source, destinations, callback) {
    let currentChannel = null;
    let currentLength = null;
    source
        // чтение из потока в дискретном режиме
        .on('readable', () => {

            let chunk;

            // считывается идентификатор канала, это первый байт в потоке
            if (currentChannel === null) {
                chunk = source.read(1);
                currentChannel = chunk && chunk.readUInt8(0);
            }

            // считывается размер данных, это следующие 4 байта в потоке
            if (currentLength === null) {
                chunk = source.read(4);
                currentLength = chunk && chunk.readUInt32BE(0);
                // если данных в буфере потока не достаточно, что мало вероятно, то
                //      метод read вернет null, тогда парсинг прерывается и попытка 
                //      повторяется в следующем событии readable
                if (currentLength === null) {
                    return;
                }
            }

            // делается попытка прочитать количество данных указанное в пакете 
            chunk = source.read(currentLength);
            if (chunk === null) {
                return;
            }

            console.log('--- получение пакета --- channel: ' + currentChannel);

            // запись данных в нужный целевой канал
            destinations[currentChannel].write(chunk);

            // сброс переменных currentChannel и currentLength для 
            //      анализа следующего пакета
            currentChannel = null;
            currentLength = null;
        })
        // после завершения чтения из канала ­источника 
        //      закрываются все целевые каналы
        .on('end', () => {
            destinations.forEach(destination => destination.end());
            console.log('--- all streams closed');
            if (callback) {
                callback();
            }
        });
}

// Демультиплексирование на стороне сервера.
async function streams_demux(callback) {
    return new Promise(async (resolve, reject) => {

        // запуск TCP сервера на порте 3000
        const server = net.createServer(
            (socket) => {

                // для каждого соединения создаются два потока для записи в файлы:
                //      стандартного вывода и стандартной ошибки
                const stdoutStream = fs.createWriteStream(path.join(filepath145, 'stdout.log'));
                const stderrStream = fs.createWriteStream(path.join(filepath145, 'stderr.log'));

                // stdoutStream и stderrStream - это целевые каналы
                demultiplexChannel(socket, [stdoutStream, stderrStream], callback);
            }
        )
            .listen(
                3000,
                () => {
                    console.log('--- SERVER: http://localhost:3000');
                    resolve(server);
                }
            );
    });
}

//
async function streams_mux_demux() {
    console.log(`
        --- --- --- streams_mux_demux --- --- ---
    `);

    // Программа запускает дочерний процесс и направляет stdout и stderr 
    //      на удаленный сервер, который сохраняет их в два файла. Роль 
    //      общего канала играет TCP­ соединение, а потоки-­источники это 
    //      stdout и stderr. 

    // костыль чтобы автоматически останавливать всю структуру
    const handlers = {
        server: null,
        child: null,
        socket: null,
        // очистка выполняется при первом завершении операций, либо на сервере, 
        //      либо на клиенте, поскольку пакеты могут потеряться и сервер 
        //      не успевает отрабатывать последнее условие
        clear() {
            this.server && this.server.close();
            this.child && this.child.kill();
            this.socket && this.socket.destroy();
        }
    };

    // 1. запуск сервера
    //      node server
    handlers.server = await streams_demux(() => {
        console.log('--- streams_demux: kill and destroy');
        handlers.clear();
    });

    // 2. запуск клиента, где передается путь к файлу дочернего процесса:
    //      node client generateData.js
    //      streams_mux(process.argv[2], process.argv.slice(3))
    const { socket, child } = await streams_mux(sourceCode, [], () => {
        console.log('--- streams_mux: kill and destroy');
        handlers.clear();
    });
    handlers.socket = socket;
    handlers.child = child;
}

// --- 14.6 Мультиплексирование и демультиплексирование объектных потоков.

// ternary-stream 
//      https://npmjs.org/package/ternary-stream

// Шаблон 'мультиплексор/демультиплексор' применим к объектным потокам, для 
//      этого каждому объекту присваивается свойство channelID вместо передачи
//      нескольких байт метаданных.

// Другой шаблон заключается в маршрутизации поступающих данных на основании 
//      заданного условия. Этот шаблон позволяет реализовать сложное разделение 
//      потоков. Демультиплексор принимает поток объектов и распределяет их по 
//      соответствующим целевым потокам на основе данных объекта.

// --- Запуск.

(async () => {

    await mkdirs(basepath, dirnames);

    // 
    //await streams_combined();
    //await streams_fork();
    //await streams_merge();
    await streams_mux_demux();
})();