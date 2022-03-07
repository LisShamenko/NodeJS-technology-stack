const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'PatternCallback/data.txt');
const validJsonPath = path.join(__dirname, 'PatternCallback/valid_json.json');
const noValidJsonPath = path.join(__dirname, 'PatternCallback/no_valid_json.txt');



// --------------- 1. Шаблон Callback

// Обратный вызов (Callback) – это функция, передающая результат выполнения вызываемой
//      функции в исходный код. Этот шаблон реализуется при помощи замыканий JavaScript, 
//      так как замыкания сохраняют контекст кода в котором оно объявлено.
//      https://developer.mozilla.org/ru/docs/Web/JavaScript/Closures

// --- 1.1 Стиль передачи продолжений (Continuation­ Passing Style, CPS).

// Обратный вызов JavaScript это функция, передаваемая в другую функцию и вызываемая 
//      после ее завершения. Этот способ передачи результат называется CPS - Continuation­ 
//      Passing Style. Обратный вызов это общая концепция, которая может использоваться
//      как с синхронными операциями, так и с асинхронными. Синхронные функции блокируют 
//      выполнение до своего завершения. Асинхронная функция возвращает управление 
//      немедленно, а ее результат передается обработчику в цикле событий.

// --- --- Синхронный CPS.

// синхронная операция, прямой стиль
function syncDirect(a, b) {
    // прямой стиль, результат возвращается через return
    return a + b;
}

// синхронная операция, CPS
function syncCallback(a, b, callback) {
    // callback возвращает результат сразу после выполнения функции
    callback(a + b);
}

// вызов синхронной функции
function sync_call() {
    console.log('--- sync_call (синхронная функция) --- before');
    console.log('--- sync direct add --- Result: ' + syncDirect(1, 2));
    syncCallback(1, 2, result => console.log('--- sync callback add --- Result: ' + result));
    console.log('--- sync_call (синхронная функция) --- after');
}

// --- --- Асинхронный CPS.

// асинхронная функция
function asyncCallback(a, b, callback) {
    // функция setTimeout немедленно возвращает управление, что обеспечивает передачу 
    //      управления циклу событий, асинхронный запрос генерирует новое событие, 
    //      которое помещается в очередь событий и обрабатывается в цикле
    setTimeout(() => callback(a + b), 100);
}

// вызов асинхронной функции
function async_call() {
    console.log('--- async_call (асинхронная функция) --- before');
    // функция обратного вызова сохраняет контекст асинхронной функции
    asyncCallback(1, 2, (result) => {
        // выполнение возобновляется после завершения асинхронной операции, функция 
        //      обратного вызова запускается циклом событий
        console.log('--- async_call --- Result: ' + result)
    });
    console.log('--- async_call (асинхронная функция) --- after');
}

// --- 1.2 Высвобождение Залго.

// Функция ведет себя непредсказуемо, если в одних условиях работает синхронно, а в 
//      других асинхронно. Ошибки вызываемые работой таких функций очень сложно выявить!
//      Чтобы избежать проблем следует точно задавать поведение функций: синхронная или 
//      асинхронная.

// Исаак З. Шлуетер (Isaac Z. Schlueter) сравнил применение непредсказуемых функций
//      с выпуском на волю Залго. Залго (Zalgo) – это интернет­ легенда о зловещей 
//      сущности, считающейся причиной безумия, смерти и разрушения мира. 
//
//      https://blog.izs.me/2013/08/designing-apis-for-asynchrony/

try {
    console.log('--- file path = ' + dataPath);
    if (fs.existsSync(dataPath)) {
        console.log('--- --- file exists');
    }
} 
catch (err) {
    console.log('--- --- file not exists');
}

// 
let cache = {};
function clear_cache() {
    cache = {};
}

// 
function syncAndAsyncRead(filename, callback) {
    if (cache[filename]) {
        // вызывается синхронно
        callback(cache[filename]);
    } 
    else {
        // асинхронная функция
        fs.readFile(filename, 'utf8', (err, data) => {
            cache[filename] = data;
            callback(data);
        });
    }
}

// 
function createFileReader(filename) {

    // 
    const listeners = [];
    syncAndAsyncRead(filename, value => {
        listeners.forEach(listener => listener(value));
    });

    // 
    return {
        onDataReady: listener => listeners.push(listener)
    };
}

// 
function syncAndAsyncReadFile() {

    // первый запрос на чтение из файла, syncAndAsyncRead выполняется асинхронно, 
    //      поэтому можно зарегистрировать обработчик через onDataReady  
    const reader = createFileReader(dataPath);
    reader.onDataReady(data => {
        console.log('--- первый запрос на чтение из файла --- ' + data);

        // второй запрос на чтение из файла, syncAndAsyncRead выполняется синхронно,
        //      обработчики зарегистрированные через onDataReady будут выполнены 
        //      немедленно, но регистрация выполняется после вызова createFileReader
        const reader2 = createFileReader(dataPath);
        reader2.onDataReady(data => {
            console.log('--- второй запрос на чтение из файла --- ' + data);
        });
    });
}

// 
function sync_and_async_read_file() {
    console.log('--- синхронная и асинхронная функция ---');
    clear_cache();
    syncAndAsyncReadFile();
}

// --- 1.3 Синхронный интерфейс.

// Шаблон 'синхронный интерфейс' - прямой стиль используется при создании 
//      синхронных функций.

// Синхронный интерфейс можно использовать не всегда, так же он будет блокировать 
//      цикл событий и отложенные параллельные запросы. Синхронная обработка
//      останавливает работу всего приложения и не рекомендуется во многих случаях.
//      Однако иногда это самое простое и эффективное решение, например, 
//      синхронный блокирующий код для чтения файла конфигурации при начальной 
//      загрузке приложения.

function only_sync_read() {
    console.log('--- только синхронная функция ---');
    clear_cache();
    onlySyncRead(dataPath);
}

// синхронная функция
function onlySyncRead(filename) {
    // для синхронной функции следует использовать только прямой стиль 
    //      передачи результата
    if (cache[filename]) {
        return cache[filename];
    } 
    else {
        cache[filename] = fs.readFileSync(filename, 'utf8');
        return cache[filename];
    }
}

// --- 1.4 Асинхронный интерфейс.

// Шаблон 'асинхронный интерфейс' - асинхронное выполнение обратного вызова 
//      гарантируется за счет использования метода 'process.nextTick'.

// Асинхронный интерфейс строится на том, что выполнение всех синхроных операций 
//      откладывается до следующей итерации цикла событий. Осуществляется это 
//      при помощи метода 'process.nextTick', который принимает обратный вызов, 
//      добавляет его в начало очереди событий и немедленно возвращает управление. 
//      Обратный вызов выполняется на следующей итерации цикла событий.

// Похожего результата можно добиться при помощи функции setImmediate. Разница 
//      в том, что 'process.nextTick' помещает обработчик в начало очереди и это 
//      может привести к задержкам в определенных обстоятельствах, а setImmediate 
//      помещает обработчик в конец после событий уже находящихся в очереди и 
//      задержка невозможна. 

//
function only_async_read() {
    console.log('--- только асинхронная функция ---');
    clear_cache();
    onlyAsyncRead(dataPath, (data) => {
        console.log('--- --- data: ' + data);
    });
}

// асинхронная функция
function onlyAsyncRead(filename, callback) {
    if (cache[filename]) {
        // отложить ассинхронную операцию до следующей итерации
        process.nextTick(() => callback(cache[filename]));
    } 
    else {
        // асинхронная функция
        fs.readFile(filename, 'utf8', (err, data) => {
            cache[filename] = data;
            callback(data);
        });
    }
}

// --- 1.5 Соглашения об обратных вызовах.

// --- --- Обратные вызовы передаются последними.

// Параметр с функцией обратного вызова должен быть последним в списке параметров.
//      function funcName([options], callback)

// --- --- Ошибки передаются первыми.

// Функция обратного вызова должна принимать ошибку в качестве первого параметра, 
//      если операция завершается успешно, то в обработчик передается null или
//      undefined, иначе объект ошибки. Ошибка всегда должна иметь тип Error.
//      Рекомендуется всегда проверять наличие ошибки в обработчиках.
//      function callbackName(error, data)

// --- --- Распространение ошибок.

// Распространение ошибок в функциях прямого синхронного стиля реализуется оператором
//      throw, который продвигает ошибку по стеку вызовов до ее обработчика. 

// Распространение ошибок в асинхронных функциях CPS стиля реализуется за счет передачи
//      ошибки в следующую функцию обратного вызова.

function read_json_error() {

    console.log('--- парсинг json без ошибки ---');
    readJsonError(validJsonPath, (data) => {
        console.log('--- --- json data: ' + data);
    });

    console.log('--- парсинг json с ошибкой ---');
    readJsonError(noValidJsonPath, (data) => {
        console.log('--- --- json data: ' + data);
    });
}

// асинхронная функция с перехватом ошибок
function readJsonError(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {

        // распространение ошибки и выход из текущей функции
        if (err) {
            return callback(err);
        }

        // анализ содержимого файла
        try {
            let parsed = JSON.parse(data);
            // если ошибок нет, то передаются только данные
            callback(null, parsed);
        } 
        catch (err) {
            // перехват обрабатываемых ошибок
            return callback(err);
        }
    });
};

// --- --- Неперехваченные исключения.

// Исключение, перехваченное внутри асинхронного обратного вызова, будет передано 
//      циклу событий и никогда не достигнет следующего обратного вызова. Чтобы
//      этого избежать следует выполнять перехват и обработку ошибок в блоке 
//      try...catch, иначе ошибка станет неустранимой и приложение завершится 
//      с выводом сообщения об ошибке в stderr.

// асинхронная функция без обработки ошибок
function readJsonThrow(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }

        // отсутствует перехват ошибок
        callback(null, JSON.parse(data));
    });
};

// парсинг недопустимого файла JSON
function read_no_json() {
    console.log('--- генерация ошибки ---');

    // обертывание вызова readJsonThrow блоком try...catch работать не будет,
    //      так как это разные стеки функций: 
    //      блок кода read_no_json - это стек вызова асинхронной операции
    //      обработчик асинхронной операции с ошибкой - это стек цикла событий
    try {
        // исключение попадет в стек из функции обратного вызова, затем 
        //      в цикл событий, где оно будет перехвачено и приложение 
        //      будет завершено
        readJsonThrow(noValidJsonPath, function (err, result) {
            console.log('--- недостижимая ошибка --- err = ' + err);
        });
    } 
    catch (err) {
        console.log(`
            --- отсутствует перехват 
            --- This will not catch the JSON parsing exception
        `);
    }
}

// При перехвате исключения в цикле события, генерируется специальное событие 
//      uncaught_exception. Обработка этого события позволяет выполнить некоторые
//      действия в случае аварийного завершения программы.

function uncaught_exception() {
    // перед завершением процесса генерируется специальное событие uncaughtException
    process.on('uncaughtException', (err) => {
        console.error(`
            --- перехват uncaughtException 
            --- This will catch at last the JSON parsing exception: ${err.message}
        `);

        // Прерывание приложения с возвратом 1 (ошибка) в качестве кода завершения:
        //      если опустить эту строку, работа приложения будет продолжена
        //      process.exit(1);

        // рекомендуется завершать приложение после появления необработанного 
        //      исключения, так как нет гарантии, что приложение продолжит 
        //      выполняться без ошибок
    });
}

// --- Запуск.

sync_call();
async_call();
sync_and_async_read_file();
only_sync_read();
only_async_read();
read_json_error();
read_no_json();
uncaught_exception();