const fs = require('fs');
const events = require('events');
const EventEmitter = events.EventEmitter;
const glob = require('glob');

const path = require('path');
const filesPath = path.join(__dirname, './PatternObserver/');
const txtFilePath = path.join(__dirname, './PatternObserver/txt-file.txt');
const jsonFilePath = path.join(__dirname, './PatternObserver/json-file.json');



// --------------- 3. Шаблон: наблюдатель (Observer).

// Шаблон наблюдатель (Observer) - определяет объект (называемый субъектом), 
//      способный уведомить ряд наблюдателей (или обработчиков) об изменении 
//      своего состояния.

// Шаблоны Reactor, Callback, Module и Observer являются основой платформы.

// --- 3.1 EventEmitter.

// Реализацией шаблона Observer в NodeJS является класс EventEmitter, который 
//      позволяет регистрировать обработчики событий и генерировать эти события. 

// Основные методы класса EventEmitter. Все методы возвращают экземпляр EventEmitter. 
//      Обработчики принимают параметры передаваемые через emit. Внутри обработчика
//      ссылка this указывает на EventEmitter, пославший событие.
//      on(event, listener)                 регистрирует обработчик для заданного события
//      once(event, listener)               регистрирует одноразовый обработчик
//      emit(event, [arg1], [...])          генерирует событие и передает данные обработчикам
//      removeListener(event, listener)     удаляет обработчик

// 
function findPattern(files, regex) {
    const emitter = new EventEmitter();
    files.forEach(function (file) {
        fs.readFile(file, 'utf8', (err, content) => {

            // error генерируется в случае ошибки чтения файла
            if (err) {
                return emitter.emit('error', err);
            }

            // fileread генерируется после чтения файла
            emitter.emit('fileread', file);

            // found генерируется при обнаружении совпадения
            let match;
            if (match = content.match(regex)) {
                match.forEach(elem => emitter.emit('found', file, elem));
            }
        });
    });
    return emitter;
}

// 
function find_pattern() {
    findPattern([txtFilePath, jsonFilePath], /hello \w+/g)
        .on('fileread', file => {
            console.log(`--- fileread 
                --- file: ${file}
            `);
        })
        .on('found', (file, match) => {
            console.log(`--- found 
                --- match: ${match} 
                --- file: ${file}
            `);
        })
        .on('error', err => {
            console.log(`--- error 
                --- error: ${err.message}
            `);
        });
}

// --- 3.2 Распространение ошибок.

// EventEmitter генерирует события асинхронно, поэтому при появлении ошибки 
//      исключение не возбуждается, оно будет потеряно в цикле событий. Событие 
//      error позволяет избежать этой проблемы. Если же обработчик не зарегистрировать, 
//      то ошибка приведет к завершению программы.

// --- 3.3 Наследование от EventEmitter.

// расширение класса EventEmitter
class FindPattern extends EventEmitter {
    constructor(regex) {
        super();
        this.regex = regex;
        this.files = [];
    }

    // 
    addFile(file) {
        this.files.push(file);
        return this;
    }

    // 
    find() {
        this.files.forEach(file => {
            fs.readFile(file, 'utf8', (err, content) => {
                if (err) {
                    return this.emit('error', err);
                }

                // 
                this.emit('fileread', file);

                // 
                let match = null;
                if (match = content.match(this.regex)) {
                    match.forEach(elem => this.emit('found', file, elem));
                }
            });
        });
        return this;
    }
}

// 
function find_pattern_object() {
    const findPatternObject = new FindPattern(/hello \w+/);
    findPatternObject
        .addFile(txtFilePath)
        .addFile(jsonFilePath)
        .find()
        .on('found', (file, match) => {
            console.log(`--- found 
                --- match: ${match} 
                --- file: ${file}
            `);
        })
        .on('error', err => {
            console.log(`--- error 
                --- error: ${err.message}
            `);
        });
}

// --- 3.4 Синхронные и асинхронные события.

// Когда события создаются асинхронно, новые обработчики могут быть зарегистрированы 
//      после инициализации EventEmitter, так как события не будут возбуждены 
//      до следующей итерации цикла событий. 
class SyncEmit extends EventEmitter {
    constructor() {
        super();
        // Синхронная генерация событий требует, чтобы все обработчики были 
        //      зарегистрированы до начали отправки событий EventEmitter. Это 
        //      событие никогда не будет обработана, так как нельзя зарегистрировать 
        //      обработчик перед созданием EventEmitter.
        this.emit('ready');
    }
}

// 
function sync_emit() {
    const syncEmit = new SyncEmit();
    syncEmit.on('ready', () => console.log('--- ready'));
}

// --- 3.5 Класс EventEmitter и обратные вызовы.

// Обратные вызовы следует использовать для возврата результата после асинхронной 
//      операции. События применяются, чтобы оповестить о том, что произошло.

// helloEvents и helloCallback дают одинаковый результат, но различаются 
//      в удобочитаемости, семантике и объеме кода
function helloEvents() {
    const eventEmitter = new EventEmitter();
    setTimeout(() => eventEmitter.emit('hello', 'hello world'), 100);
    return eventEmitter;
}

function helloCallback(callback) {
    setTimeout(() => callback('hello world'), 100);
}

function hello_events_callback() {
    const eventEmitter = helloEvents();
    eventEmitter.on('hello', () => console.log('--- hello events ---'));
    helloCallback(() => console.log('--- hello callback ---'));
}

// При необходимости генерировать события разных типов предпочтительнее использовать 
//      EventEmitter. При использовании обратного вызова можно передавать тип события 
//      как аргумент в обработчик или использовать свой обработчик для каждого типа 
//      события.

// Класс EventEmitter предпочтительнее использовать, когда событие может возникнуть 
//      неопределенное количество раз. Механизм обратного вызова подразумевает всегда 
//      один вызов, независимо от успешности операции.

// Класс EventEmitter может отправить уведомление сразу нескольким слушателям. Механизм 
//      обратного вызова всегда возвращается в конкретную точку вызова, то есть только 
//      одна функция. 

// --- 3.6 Шаблон: комбинация EventEmitter и обратных вызовов.

// Шаблон 'комбинация EventEmitter и Callback' - создается функция, принимающая функцию 
//      обратного вызова и возвращающая EventEmitter, что обеспечивает явную точку входа 
//      для выполнения основных функций и генерацию событий с помощью EventEmitter, 
//      предоставляющих более подробную информацию.

// node-glob - модуль реализует поиск файлов с применением шаблонных символов:
//      https://www.npmjs.com/package/glob

function glob_file() {

    // функция glob в первом аргументе принимает шаблон поиска, после следует 
    //      функция обратного вызова, в которую передается список файлов, 
    //      соответствующих шаблону
    let g = glob(
        filesPath + '*.json',
        (error, files) => console.log(`--- Files: ${JSON.stringify(files)}`)
    );

    // функция возвращает EventEmitter, позволяющий получить более подробный 
    //      отчет о состоянии процесса
    g.on('match', match => console.log(`--- Match: ${match}`));
}

// --- Запуск.

find_pattern();
find_pattern_object();
sync_emit();
hello_events_callback();
glob_file();