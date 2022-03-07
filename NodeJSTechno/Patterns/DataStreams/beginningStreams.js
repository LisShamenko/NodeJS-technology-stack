"use strict";

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const crypto = require('crypto');
const mkdirp = require('mkdirp');

// 
const { mkdirs } = require('./../Utilities/OpsFiles');
const basepath = path.join(__dirname, './../dist');
const dirnames = ['112', '113'];

// 
const file11 = path.join(__dirname, './../Source/parts/', 'part1.txt');
const filepath112 = path.join(__dirname, './../dist/112');
const getPath = (file) => path.join(filepath112, file);

// 
const filepath113 = path.join(__dirname, './../dist/113');


// --------------- 11. Потоки данных (streams) 

// --- 11.1 Буферизация и потоковая передача данных.

// В режиме буферизации операции ввода считывают все данные за один раз и помещают 
//      их в буфер, после чего все данные передаются дальше по коду на обработку.

// Потоки данных позволяют обрабатывать данные по мере их поступления из ресурса.
//      В NodeJS потоки могут объединяться в одну цепочку обработки.

// Различия между буферизацией и потоком можно разделить на две категории:
//      - эффективность с точки зрения памяти
//      - эффективность с точки зрения времени

// --- 11.2 Эффективность с точки зрения памяти.

// При считывании большого файла требуется буфер равный размеру этого файла. Расход 
//      памяти увеличивается еще сильнее при параллельной обработке нескольких файлов.
//      Кроме того, буферы V8 не могут быть больше 0x3FFFFFFF байт (чуть меньше 1 ГБ).

// сжатие при помощи буфера
function gzip_buffer() {

    // для файла больше 1 ГБ получим сообщение об ошибке:
    //      RangeError: File size is greater than possible Buffer: 0x3FFFFFFF bytes
    fs.readFile(file11, (err, buffer) => {
        zlib.gzip(buffer, (err, buffer) => {
            fs.writeFile(
                getPath('first.gz'),
                buffer,
                (err) => console.log(`--- ${err ? ('err: ' + err) : 'complete'}`)
            );
        });
    });
}

// сжатие при помощи потока
function gzip_streams() {

    // работа этого кода не зависит от размера файла
    fs.createReadStream(file11)
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream(getPath('second.gz')))
        .on('finish', () => console.log('--- complete'));
}

// --- 11.3 Эффективность с точки зрения времени.

// Клиент сжимает файл и отправляет его на сервер. Сервер распоковывает файл и 
//      сохраняет его в своей файловой системе. 

// При использовании буферов. Клиент должен прочитать весь файл и сжать его целиком, 
//      после чего выполнить отправку файла на сервер. Сервер сможет распоковать 
//      файл только после получения всех данных.

// При использовании потоков. Клиент и сервер не дожидаются получения всех данных.
//      Передача файла начинается после прочтения первого блока файла на клиенте.
//      Перед чтением следующего блока данных нет необходимости ждать завершения 
//      предыдущего набора заданий, все задания являются аиснхронными и выполняются
//      параллельно. Важен порядок в котором блоки данных поступают на этапы обработки,
//      но за этим следят сами потоки. 

// Обработка файла состоит из набора заданий, которые выполняются последовательно
//      для каждого отдельного блока данных:
//      1. [Клиент] Чтение из файловой системы.
//      2. [Клиент] Сжатие данных.
//      3. [Клиент] Отправка на сервер.
//      4. [Сервер] Получение от клиента.
//      5. [Сервер] Распаковка данных.
//      6. [Сервер] Запись данных на диск.

// Потоки данных можно объединять при помощи метода pipe. Каждый поток отвечает за 
//      выполнение одной операции. Объединение возможно благодаря единому интерфейсу 
//      потоков данных, который позволяет им взаимодействовать друг с другом.
//      Следующий поток в конвейере должен поддерживать тип данных, отправляемых
//      предыдущим потоком. Преимуществами объединения потоков является повторное 
//      использование, более наглядный и модульный код.

// 
async function gzip() {
    await gzipServer();
    await gzipClient(file11, 'localhost');
}

// сервер
async function gzipServer() {

    // сервер обрабатывает данные по мере их получения из потока
    function serverHandler(req, res) {

        const filename = path.join(filepath113, `server_${req.headers.filename}`);

        // настройки для дешифровки данных
        const keyBytes = crypto.scryptSync('a_shared_secret', 'salt', 32);
        const ivText = req.headers.iv;
        const ivBytes = Buffer.from(ivText, 'base64');

        // объединение потоков
        req
            // дешифровка данных
            .pipe(crypto.createDecipheriv('aes256', keyBytes, ivBytes))
            // распаковка
            .pipe(zlib.createGunzip())
            // запись в файл
            .pipe(fs.createWriteStream(filename))
            // 
            .on('finish', () => {
                res.writeHead(201, { 'Content-Type': 'text/plain' });
                res.end();
                console.log(`--- complete, filename: ${filename}`);
            });
    }

    // 
    return new Promise((resolve, reject) => {

        // 
        const server = http.createServer(serverHandler);

        // запуск сервера
        server.listen(3000, () => {
            resolve(server);
        });
    });
}

// клиент
async function gzipClient(file, hostname) {

    // настройки шифрования
    const keyBytes = crypto.scryptSync('a_shared_secret', 'salt', 32);
    const ivBytes = crypto.randomBytes(16);
    const ivText = ivBytes.toString('base64');

    // 
    const options = {
        hostname: hostname,
        port: 3000,
        path: '/',
        method: 'PUT',
        headers: {
            filename: path.basename(file),
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'gzip',
            'iv': ivText
        }
    };

    // 
    return new Promise((resolve, reject) => {
        try {

            // запрос на сервер
            const req = http.request(options, res => {
                console.log(`--- server response: ${res.statusCode}`);
                resolve();
            });

            // объединение потоков
            fs
                // поток для чтения файла
                .createReadStream(file)
                // поток для сжатия
                .pipe(zlib.createGzip())
                // поток для шифрования данных
                .pipe(crypto.createCipheriv('aes256', keyBytes, ivBytes))
                // поток request для отправки данных на сервер 
                .pipe(req)
                .on('finish', () => console.log('--- file sent to server'));
        }
        catch (err) {
            console.log(`--- err: ${err}`);
            reject(err);
        }
    });
}

// --- Запуск.

// 
(async () => {

    // 
    await mkdirs(basepath, dirnames);

    // 
    gzip_buffer();
    gzip_streams();
    await gzip();
})();
