"use strict"

// --------------- --------------- --------------- express

// документация express:
//      https://expressjs.com/ru/api.html

//
const express = require('express');
const app = express();

// --------------- body-parser

// документация body-parser:
//      http://expressjs.com/en/resources/middleware/body-parser.html

//
const bodyParser = require('body-parser');
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// --------------- etag

// пакет etag
//      https://www.npmjs.com/package/etag
//      https://stackoverflow.com/questions/24542959/how-does-a-etag-work-in-expressjs

app.enable('etag');         // use strong etags
app.set('etag', true);      // weak etags
app.set('etag', 'strong');  // same
app.set('etag', 'weak');    // weak etags

const etag = require('etag');
app.set('etag', function (body, encoding) {
    // return valid etag
    return etag(body);
});

// --------------- fresh

// fresh используется express
//      https://www.npmjs.com/package/fresh

const fresh = require('fresh');

function freshTest(req, res, next) {
    // perform server logic
    // ... including adding ETag / Last-Modified response headers

    if (isFresh(req, res)) {
        // client has a fresh copy of resource
        res.statusCode = 304;
        res.end();
        return;
    }

    // send the resource
    res.statusCode = 200
    res.end('hello, world!')
}

function isFresh(req, res) {
    return fresh(req.headers, {
        'etag': res.getHeader('ETag'),
        'last-modified': res.getHeader('Last-Modified')
    })
}

// --------------- express.Router

let router = express.Router({
    'caseSensitive': false,     // чувствительность к регистру символов
    'mergeParams': false,       // добавить параметры из родительского маршрутизатора
    'strict': false,            // true - строгая маршрутизация, точное совпадение с маршрутом
});

// invoked for any requests passed to this router
router.use(function (req, res, next) {
    // .. some logic here .. like any other middleware
    next();
})

// will handle any request that ends in /events depends on where the router is "use()'d"
router.get('/events', function (req, res, next) {
    // ..
})

// only requests to /calendar/* will be sent to our "router"
app.use('/calendar', router)


// --------------- express.static

// основан на serve-static

const staticOptions = {
    'dotfiles': 'ignore',               // как обрабатываются файлы начинающиеся с '.'
    'etag': false,                      // true - включить генерацию etag, всегда генерируются weak ETags
    'extensions': ['htm', 'html'],      // резервные расширения, для дополнительного поиска файла
    'fallthrough': false,               // true - при ошибке вызывается next(), для соспоставления с несколькими маршрутами (несколько статических каталогов), false - возвращается ошибка 404
    'immutable': false,                 // управляет кэшированием ответа, заголовок Cache-Control
    'index': 'index.html',              // устанавливает index файл для каталога, false - игнорирует index файл 
    'lastModified': false,              // true - установить дату последнего изменения файла в OS
    'maxAge': '1d',                     // задает max-age заголовка Cache-Control в миллисекундах 
    'redirect': false,                  // перенапрвляет запрос на маршрут '/' если запрашивается каталог
    'setHeaders': setHeadersFunc        // функция определяет заголовки ответа
}
app.use(express.static(__dirname + '/frontend', staticOptions));
app.use(express.static(__dirname + '/public', staticOptions));

// значения dotfiles:
// allow - запрос разрешается
// deny - запрос отклоняется, возвращается ошибка 403
// ignore - игнорируются, возвращается ошибка 404

// кэширование immutable
//      https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Cache-Control

function setHeadersFunc(res, path, stat) {
    res.set('x-timestamp', Date.now())
}

// пакет serve-static
//      http://expressjs.com/en/resources/middleware/serve-static.html

// пакет ms
//      https://www.npmjs.com/package/ms
const ms = require('ms');
console.log(" --- 2 days = " + ms('2 days') + " --- 1d = " + ms('1d') + " --- 10h = " + ms('10h') + " --- '2.5 hrs' = " + ms('2.5 hrs') + " --- 2h = " + ms('2h') + " --- 1m = " + ms('1m') + " --- 5s = " + ms('5s') + " --- 1y = " + ms('1y') + " --- 100 = " + ms('100') + " --- '-3 days' = " + ms('-3 days') + " --- '-1h' = " + ms('-1h') + " --- '-200' = " + ms('-200'));

// --------------- express.json / express.raw / express.text

// парсинг запроса json, основано на body-parser

app.use(express.json({
    inflate: true,                  // true - поддерживает сжатые (compressed) body
    limit: 1024 * 1024,             // максимальный размер body, можно указать строку поддерживаемую пакетом bytes
    reviver: reviverFunc,           // передается 2-м параметром в JSON.parse
    strict: false,                  // true - парсит только массивы и объекты
    type: 'application/*+json',     // парсит запросы с указанным content-type, передается в type-is, по умолчанию'application/json'
    verify: verifyFunc,             // функция верификации body
}));

app.use(express.raw({
    inflate: true,
    limit: 1024 * 1024,
    type: 'application/octet-stream',   // по умолчанию "application/octet-stream"
    verify: verifyFunc,
}));

app.use(express.text({
    defaultCharset: 'utf-8',            // кодировка текста по умолчанию, если не указан Content-Type
    inflate: true,
    limit: 1024 * 1024,
    type: 'text/plain',                 // по умолчанию "text/plain"
    verify: verifyFunc,
}));

// пакет для сжатия
//      http://expressjs.com/en/resources/middleware/compression.html

// пакет для анализа строк с описанием байт
//      https://www.npmjs.com/package/bytes
const bytes = require('bytes');
console.log(bytes('1b'));
console.log(bytes('1kb'));
console.log(bytes('1mb'));
console.log(bytes('1gb'));
console.log(bytes('1tb'));
console.log(bytes('1pb'));

// reviver - функция "(key, value) => {}" 
//      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter
JSON.parse('{"1": 1, "2": 2, "3": {"4": 4, "5": {"6": 6}}}', reviverFunc);
function reviverFunc(key, value) {
    // return value * 2 for numbers or everything else unchanged
    let newValue = typeof value === 'number' ? value * 2 : value;
    console.log('key = ' + key + ' ---  old value = ' + value + ' --- new value = ' + newValue);
    return newValue;
}

// пкает type-is
//      https://www.npmjs.com/package/type-is
const typeis = require('type-is');
let mediaType = 'application/json';
typeis.is(mediaType, ['json']);             // => 'json'
typeis.is(mediaType, ['html', 'json']);     // => 'json'
typeis.is(mediaType, ['application/*']);    // => 'application/json'
typeis.is(mediaType, ['application/json']); // => 'application/json'
typeis.is(mediaType, ['html']);             // => false

function bodyParserMW(req, res, next) {
    if (!typeis.hasBody(req)) {
        return next()
    }

    switch (typeis(req, ['urlencoded', 'json', 'multipart'])) {
        case 'urlencoded':
            // parse urlencoded body
            throw new Error('implement urlencoded body parsing')
        case 'json':
            // parse json body
            throw new Error('implement json body parsing')
        case 'multipart':
            // parse multipart body
            throw new Error('implement multipart body parsing')
        default:
            // 415 error code
            res.statusCode = 415
            res.end()
            break
    }
}

// функция верификации 
function verifyFunc(req, res, buf, encoding) {
    console.log('buf = ' + buf + ' --- encoding = ' + encoding);
}

// --------------- express.urlencoded

express.urlencoded({
    extended: false,                            // false - querystring / true - qs
    inflate: true,
    limit: 1024 * 1024,
    parameterLimit: 1000,                       // максимальное количество параметров в URL
    type: 'application/x-www-form-urlencoded',  // по умолчанию "application/x-www-form-urlencoded"
    verify: verifyFunc,
});

//      https://developer.mozilla.org/ru/docs/Web/HTTP/Methods/POST
//      https://www.geeksforgeeks.org/express-js-express-urlencoded-function/

// пакет qs
//      https://www.npmjs.com/package/qs

// пакет query-string
//      https://www.npmjs.com/package/query-string


// --------------- --------------- --------------- application


// Маршрутизация HTTP-запросов: app.METHOD и app.param
// Настройка промежуточного программного обеспечения: app.route
// Визуализация HTML-представлений: app.render
// Регистрация шаблонизатора: app.engine
// Настройки (свойства): app.set


// --------------- app.locals

// app имеет свойства, которые являются локальными переменными в пределах приложения
// сохраняются на протяжении всего жизненного цикла приложения
// локальные переменные доступны в промежуточном программном обеспечении через req.app.locals
app.locals.title = 'My App'
app.locals.email = 'me@myapp.com'
console.dir(app.locals.title); // => 'My App'
console.dir(app.locals.email); // => 'me@myapp.com'

// --------------- app.mountpath

// Свойство содержит один или несколько шаблонов пути, на котором был установлен суб-приложение.
// Суб-приложение - это экземпляр, express который может использоваться для обработки запроса к маршруту.

// Суб-приложение:
// - не наследует значение параметров, имеющих значение по умолчанию. Вы должны установить значение во вложенном приложении.
// - наследует значение параметров без значения по умолчанию.

// the sub app
let admin = express();
admin.get('/', function (req, res) {
    // [ '/adm*n', '/manager' ]
    console.log(admin.mountpath);
    res.send('Admin Homepage');
})

// the sub app
let secret = express();
secret.get('/', function (req, res) {
    // '/secr*t'
    console.log(secret.mountpath);
    res.send('Admin Secret');
})

// load the 'secret' router on '/secr*t', on the 'admin' sub app
admin.use('/secr*t', secret);
// load the 'admin' router on '/adm*n' and '/manager', on the parent app
app.use(['/adm*n', '/manager'], admin)

// --------------- app.on('mount', callback(parent))

// вызывается на суб-приложении, когда она устанавливается на родительском приложении
// родительское приложение передается функции обратного вызова

admin.on('mount', function (parent) {
    // refers to the parent app
    console.log('Admin Mounted --- ' + parent);
})

// --------------- app.all(path, callback [, callback ...])

// метод обрабатывает HTTP-запросы всех типов
// метод полезен для отображения «глобальной» логики для определенных префиксов пути

app.all('/secret/*',
    function (req, res, next) {
        console.log('first ...');
        // pass control to the next handler
        next();
    },
    function (req, res, next) {
        console.log('second ...');
        // pass control to the next handler
        next();
    }
);

// Path examples:
// Path:                '/abcd'
// Path Pattern:        '/abc?d', '/ab+cd', '/ab*cd', '/a(bc)?d'
// Regular Expression:  /\/abc|\/xyz/
// Array:               ['/abcd', '/xyza', /\/lmn|\/pqr/]

// Callback functions; can be:
// - A middleware function.
// - A series of middleware functions (separated by commas).
// - An array of middleware functions.
// - A combination of all of the above.

// --------------- app.delete(path, callback [, callback ...])

// обрабатывает HTTP-запрос DELETE
app.delete('/', function (req, res) {
    res.send('DELETE request to homepage');
})

// --------------- app.get(path, callback [, callback ...])

// обрабатывает HTTP-запрос GET 
app.get('/', function (req, res) {
    res.send('GET request to homepage');
})

// --------------- app.post(path, callback [, callback ...])

// обрабатывает HTTP-запрос POST
app.post('/', function (req, res) {
    res.send('POST request to homepage');
})

// --------------- app.put(path, callback [, callback ...])

// обрабатывает HTTP-запрос PUT
app.put('/', function (req, res) {
    res.send('PUT request to homepage');
})

// --------------- app.METHOD(path, callback [, callback ...])

// обрабатывает HTTP-запрос указанного типа
// METHOD:
// checkout         mkcol           purge 
// copy             move            put 
// delete           m-search        report 
// get              notify          search 
// head             options         subscribe 
// lock             patch           trace 
// merge            post            unlock 
// mkactivity                       unsubscribe 

//      http://expressjs.com/en/guide/routing.html

// --------------- app.disable(name) / app.disabled(name) / app.enable(name) / app.enabled(name)

// быстрые операции для boolean-настроек прриложения express
app.disable('trust proxy');
app.disabled('trust proxy');
app.enable('trust proxy');
app.enabled('trust proxy');

// --------------- app.get(name) / app.set(name, value)

// установить / вернуть настройку приложения exress
app.set('title', 'My Site');
app.get('title');

// --------------- settings

// Суб-приложение:
// - не наследует значение параметров, имеющих значение по умолчанию. Вы должны установить значение во вложенном приложении.
// - наследует значение параметров без значения по умолчанию.
// - исключение trust proxy наследуется всегда
// - view cache не наследуется в производственной среде (NODE_ENV === 'production')

let appSettings = {
    'case sensitive routing': undefined,            // включить чувствительность к регистру
    'env': process.env.NODE_ENV | 'production',     // environment mode
    'etag': 'weak',                                 // заголовок etag для ответа
    'jsonp callback name': 'callback',              // имя callback функции для jsonp
    'json escape': undefined,                       // для противодействия XSS атак экранирует символы: <, >, &
    'json replacer': undefined,                     // функция replacer передающаяся в JSON.stringify
    'json spaces': undefined,                       // третий аргумент передающийся в JSON.stringify
    'query parser': 'extended ',                    // 'simple' использует querystring, 'extended' использует qs, false - отключает парсинг запроса, можно задать свою функцию
    'strict routing': undefined,                    // строгое соответствие маршрутов
    'subdomain offset': 2,                          // количество частей субдоменов разделенных точками
    'trust proxy': false,                           // true - используется внешний proxy-сервер, заголовки X-Forwarded-*, свойство req.ips содержит массив IP-адресов клиентов
    'views': process.cwd() + '/views',              // каталог представлений views
    'view cache': undefined,                        // кэширование представлений views, true на производственном сервере, не наследуется на производстенном сервере
    'view engine': undefined,                       // расширение ядра представлений
    'x-powered-by': true,                           // включает HTTP-заголовок 'X-Powered-By:Express'
};

//      https://blog.mozilla.org/security/2017/07/18/web-service-audits-firefox-accounts/
//      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter

function replacer(key, value) {
    // Filtering out properties
    if (typeof value === 'string') {
        return undefined;
    }
    return value;
}

// JSON.stringify(object, replacer, space)
let foo = { foundation: 'Mozilla', model: 'box', week: 45, transport: 'car', month: 7 };
// {"week":45,"month":7}
JSON.stringify(foo, replacer);
// {
//  "a": 2
// }
JSON.stringify({ a: 2 }, null, ' ');
// returns the string:
// {
//     "uno": 1,
//     "dos": 2
// }
JSON.stringify({ uno: 1, dos: 2 }, null, '\t');

//      https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js

const querystring = require('querystring');
// if asArray=false only the first item with the same name will be returned
// if asArray=true all items will be returned as an array (even if they are a single item)
const asArray = false;
app.set("query parser", (qs) => {
    const parsed = querystring.parse(qs);
    return Object.entries(parsed).reduce((previous, [key, value]) => {
        const isArray = Array.isArray(value);
        if (!asArray && isArray) {
            value = value[0];
        } else if (asArray && !isArray) {
            value = [value];
        }

        previous[key] = value;
        return previous;
    }, {});
});

// пакет proxy-addr
//      возможные значения 'trust proxy' смотреть в документации: https://expressjs.com/ru/api.html#trust.proxy.options.table
//      https://www.npmjs.com/package/proxy-addr
//      http://expressjs.com/en/guide/behind-proxies.html

// --------------- app.engine(ext, callback)

// сопоставить расширение с функцией шаблонизатора
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// пакет ejs-locals
//      https://www.npmjs.com/package/ejs-locals
//      https://soshace.com/ru/express-js-ejs-templating/

// app.engine('pug', require('pug').__express);
// app.engine('html', require('ejs').renderFile);

// пакет consolidate
//      https://github.com/tj/consolidate.js

// let engines = require('consolidate');
// app.engine('haml', engines.haml);
// app.engine('html', engines.hogan);

// --------------- app.path()

// лучше использовать req.baseUrl, чтобы получить 'canonical path' к приложению
console.dir('path app = ' + app.path());
console.dir('path admin = ' + admin.path());
console.dir('path secret = ' + secret.path());

// --------------- app.render(view, [locals], callback)

// возвращает обработанный HTML-код представления через callback функцию
// res.render() использует app.render()
app.render('email', function (err, html) {
    // ...
})

// cache зарезервированый параметр, включает кэширование, на продакшене всегда true
app.render('email', { cache: true, name: 'Tobi' }, function (err, html) {
    // ...
})

// --------------- app.route(path)

// возвращает отдельный маршрутизатор
app.route('/events')
    .all(function (req, res, next) {
        // промежуточный обработчик для данного роутера
    })
    .get(function (req, res, next) {
        res.json({});
    })
    .post(function (req, res, next) {
        res.json({});
    })

// --------------- app.param([name], callback)

// добавляет триггеры обратного вызова к параметрам маршрута
app.param('user', function (req, res, next, id) {
    // try to get the user details from the User model and attach it to the request object
    User.find(id, function (err, user) {
        if (err) {
            next(err);
        } else if (user) {
            req.user = user;
            next();
        } else {
            next(new Error('failed to load user'));
        }
    })
})

// - функции обратного вызова Param являются локальными для маршрутизатора, на котором они определены, они не наследуются подключенными приложениями или маршрутизаторами

app.param(['id', 'page'], function (req, res, next, value) {
    console.log('CALLED ONLY ONCE with', value);
    next();
})
app.get('/user/:id/:page', function (req, res, next) {
    console.log('although this matches');
    next();
})
app.get('/user/:id/:page', function (req, res) {
    console.log('and this matches too');
    res.end();
})

//      https://expressjs.com/ru/guide/routing.html#route-parameters

// Поведение app.param(name, callback) метода можно полностью изменить, передав ему только функцию app.param(). Эта функция является настраиваемой реализацией того, как app.param(name, callback) должна себя вести.
// Первый параметр этой функции - это имя параметра URL, который должен быть записан, вторым параметром может быть любой объект JavaScript, который может использоваться для возврата реализации промежуточного программного обеспечения.
// Промежуточное ПО, возвращаемое функцией, определяет поведение того, что происходит при захвате параметра URL.

// не рекомендуется с версии 4.11.0

// customizing the behavior of app.param()
app.param(function (param, option, validator) {
    return function (req, res, next, val) {
        if (val === option || (validator && validator(val))) {
            next()
        } else {
            next('route')
        }
    }
})

// using the customized app.param()
app.param('id', 1337, undefined);
app.param('id', undefined, function (candidate) {
    return !isNaN(parseFloat(candidate)) && isFinite(candidate)
})

// route to trigger the capture
app.get('/user/:id', function (req, res) {
    res.send('OK')
})

// --------------- app.use([path,] callback [, callback...])

// устанавливает промежуточное программное обеспечение
// срабатывает для всех совпадающих маршурутов
// path по умолчанию соответствует маршруту '/' 

app.use(function (req, res, next) {
    console.log('Time: %d', Date.now())
    next()
})

// промежуточное ПО обработки ошибок всегда принимает четыре аргумента
// вы должны предоставить четыре аргумента, чтобы идентифицировать его как функцию промежуточного программного обеспечения для обработки ошибок
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

//      https://expressjs.com/ru/guide/error-handling.html


// --------------- --------------- --------------- Request

app.get('/user/:id', function (req, res) {

    // --------------- req.app

    // содержит ссылку на экземпляр приложения Express
    console.log('The views directory is ' + req.app.get('views'));

    // --------------- req.baseUrl

    // URL-адрес, на котором был смонтирован экземпляр маршрутизатора
    console.log(req.baseUrl);

    // --------------- req.body

    // содержит пары "ключ-значение" данных, отправленных в теле запроса
    // заполняется если использовать парсинг: express.json() / express.urlencoded()

    // app.use(express.json());                             // for parsing application/json
    // app.use(express.urlencoded({ extended: true }));     // for parsing application/x-www-form-urlencoded
    console.log(req.body);

    // --------------- req.cookies

    // содержит файлы cookie
    console.dir(req.cookies.name);
    // для подписанных файлов cookie
    console.dir(req.signedCookies.user);

    // пакет cookie-parser
    //      https://www.npmjs.com/package/cookie-parser

    // --------------- req.fresh

    // возвращает true если кэш клиента содержит последние изменения
    // false означает что должен быть отправлен полный ответ, чтобы обновить кэш клиента
    // false если заголовок Cache-Control равен no-cache
    console.dir(req.fresh);

    //      https://tools.ietf.org/html/rfc7234

    // --------------- req.hostname

    // содержит имя хоста, полученное из HTTP заголовка Host
    // если trust proxy не равен false, то req.hostname будет содержать значение из заголовка X-Forwarded-Host, который может быть установлен клиентом или прокси
    console.dir(req.hostname);

    //      https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host

    // --------------- req.ip

    // удаленный IP-адрес запроса
    // если trust proxy не равен false, то req.ip будет содержать значение из заголовка X-Forwarded-For, который может быть установлен клиентом или прокси
    console.dir(req.ip);

    // --------------- req.ips

    // если trust proxy не равен false, то req.ips содержит массив IP-адресов, указанных в X-Forwarded-For заголовке запроса
    console.dir(req.ips);

    // --------------- req.method

    // содержит строку, соответствующую методу HTTP запроса: GET, POST, PUT, и так далее.
    console.dir(req.method);

    // --------------- req.originalUrl

    // сохраняет исходный URL-адрес запроса
    console.dir(req.url);           // 
    console.dir(req.originalUrl);   // '/admin/new?sort=desc'
    console.dir(req.baseUrl);       // '/admin'
    console.dir(req.path);          // '/new'

    // --------------- req.params

    // содержит свойства сопоставленные с параметрами маршрута (name в '/user/:name')
    // Express автоматически декодирует значения в req.params (используя decodeURIComponent)
    console.dir(req.params.name);
    console.dir(req.params[0]);

    //      https://expressjs.com/ru/guide/routing.html#route-parameters

    // --------------- req.path

    // содержит часть пути URL-адреса запроса ('example.com/users?sort=desc' => '/users')
    // при вызове из промежуточного программного обеспечения точка монтирования не включается в req.path
    console.dir(req.path);

    // --------------- req.protocol

    // содержит строку протокола запроса: http / https
    // если trust proxy не равен false, то req.protocol будет содержать значение из заголовка X-Forwarded-Proto, который может быть установлен клиентом или прокси
    console.dir(req.protocol);

    // --------------- req.query

    // объект, содержащий свойство для каждого параметра строки запроса в маршруте
    console.dir('GET /search?q=tobi+ferret --- ' + req.query.q);                                        // => 'tobi ferret'
    console.dir('GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse --- ' + req.query.order);   // => 'desc'
    console.dir(req.query.shoe.color);      // => 'blue'
    console.dir(req.query.shoe.type);       // => 'converse'
    console.dir('GET /shoes?color[]=blue&color[]=black&color[]=red --- ' + req.query.color);            // => ['blue', 'black', 'red']

    // --------------- req.route

    // содержит текущий совпадающий маршрут
    console.log(req.route);

    // --------------- req.secure

    // свойство, принимающее значение true, если установлено соединение TLS
    console.dir(req.protocol === 'https');

    // --------------- req.signedCookies

    // свойство содержит подписанные файлы cookie, отправленные по запросу
    console.dir(req.signedCookies);

    // --------------- req.stale

    // значение противоположное Req.fresh

    // --------------- req.subdomains

    // массив поддоменов в доменном имени запроса
    // Host: "tobi.ferrets.example.com" => ['ferrets', 'tobi']
    console.dir(req.subdomains);

    // --------------- req.xhr

    // true - если заголовок X-Requested-With имеет значение XMLHttpRequest, что указывает на то, что запрос был отправлен клиентской библиотекой, такой как jQuery
    console.dir(req.xhr);

    // --------------- req.accepts(types)

    // проверяет HTTP заголовок Accept на соответствие указанным типам, если соответствие не допустимо возвращает false (406 "Not Acceptable")
    req.accepts('html');                    // Accept: text/html => "html"
    req.accepts('html');                    // Accept: text/*, application/json => "html"
    req.accepts('text/html');               // Accept: text/*, application/json => "text/html"
    req.accepts(['json', 'text']);          // => "json"
    req.accepts('application/json');        // => "application/json"
    req.accepts('image/png');               // Accept: text/*, application/json => false
    req.accepts('png');                     // Accept: text/*, application/json => false
    req.accepts(['html', 'json']);          // Accept: text/*;q=.5, application/json => "json"

    //      https://github.com/jshttp/accepts

    // --------------- req.acceptsCharsets(charset [, ...])

    // Accept-Charset HTTP

    // --------------- req.acceptsEncodings(encoding [, ...])

    // Accept-Encoding HTTP

    // --------------- req.acceptsLanguages(lang [, ...])

    // Accept-Language HTTP

    // --------------- req.get(field)

    // возвращает указанное поле заголовка HTTP-запроса
    req.get('Content-Type');    // => "text/plain"
    req.get('content-type');    // => "text/plain"
    req.get('Something');       // => undefined

    // --------------- req.is(type)

    // возвращает content type если HTTP заголовок Content-Type совпадает с указанным MIME type
    // если body отсутствует то null, или false если отсутствуют совпадения

    // With Content-Type: text/html; charset=utf-8
    req.is('html');             // => 'html'
    req.is('text/html');        // => 'text/html'
    req.is('text/*');           // => 'text/*'

    // When Content-Type is application/json
    req.is('json');             // => 'json'
    req.is('application/json'); // => 'application/json'
    req.is('application/*');    // => 'application/*'
    req.is('html');             // => false

    // пакет type-is
    //      https://github.com/jshttp/type-is

    // --------------- req.param(name [, defaultValue])

    // УСТАРЕВШИЙ - рекомендуется использовать req.params, req.body, req.query
    // возвращает значение параметра
    req.param('name');      // ?name=tobi => "tobi"
    req.param('name');      // POST name=tobi => "tobi"
    req.param('name');      // /user/tobi for /user/:name => "tobi"

    // --------------- req.range(size[, options])

    // парсинг заголовка Range
    // size - это максимальный размер ресурса
    let rangeOption = {
        combine: false,     // true - ranges будут объеденены
    };

    // возвращает массив ranges, -2 не верная строка запроса или -1 не верный диапозон

    // parse header from request
    let range = req.range(1000);

    // the type of the range
    if (range.type === 'bytes') {
        // the ranges
        range.forEach(function (r) {
            // do something with r.start and r.end
            console.log('r.start = ' + r.start + ' --- r.end = ' + r.end);
        });
    }

    // --------------- 
})

// --------------- --------------- --------------- Response

app.get('/response', function (req, res) {

    // --------------- res.app

    console.log('ссылка на приложение express --- ' + res.app);

    // --------------- res.headersSent

    // true - приложение express отправило http-заголовки
    console.dir('false --- headersSent = ' + res.headersSent);
    res.send('OK');
    console.dir('true --- headersSent = ' + res.headersSent);

    // --------------- res.locals

    // лоакльные переменные привязанные к запросу доступные только в цикле request/response
    res.locals.user = req.user;

    // --------------- res.append(field [, value])

    // добавляет значение к заголовку http
    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
    res.append('Warning', '199 Miscellaneous warning');

    // --------------- res.attachment([filename])

    // устанавливает HTTP заголовок Content-Disposition в 'attachment', если указать filename, то к Content-Disposition будет добавлен 'filename=...'и установлен заголовок Content-Type
    //      https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Content-Disposition

    res.attachment();
    // Content-Disposition: attachment

    res.attachment('path/to/logo.png');
    // Content-Disposition: attachment; filename="logo.png"
    // Content-Type: image/png

    // --------------- res.cookie(name, value [, options])

    // устанавливает cookie
    //      https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1

    let cookieOption = {
        'domain': '.example.com',                   // доменное имя для cookie, по умолчанию доменное имя приложения
        'encode': String,                           // синхронная функция кодирования файлов cookie, по умолчанию encodeURIComponent
        'expires': new Date(Date.now() + 900000),   // дата истечения срока действия cookie в GMT, 0 создает cookie сеанса
        'httpOnly': true,                           // доступный только веб-серверу
        'maxAge': 900000,                           // устанавливает время истечения cookie
        'path': '/admin',                           // путь к файлу cookie, по умолчанию '/'
        'secure': true,                             // помечает cookie для использования только с HTTPS
        'signed': true,                             // указывает, следует ли подписывать файл cookie --- res.cookie() будет использовать переданный секрет cookieParser(secret) для подписи значения
        'sameSite': false,                          // значение атрибута SameSite
    };

    res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });

    // Default encoding:    'some_cross_domain_cookie=http%3A%2F%2Fmysubdomain.example.com; Domain=example.com; Path=/'
    res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com' });
    // Custom encoding:     'some_cross_domain_cookie=http://mysubdomain.example.com; Domain=example.com; Path=/;'
    res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com', encode: String });

    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });

    res.cookie('name', 'tobi', { signed: true });

    //      https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
    //      https://coderoad.ru/58228871/Файлы-cookie-и-SameSite-Secure-ExpressJS

    // --------------- res.clearCookie(name [, options])

    // удаляет cookie с указанным именем
    res.clearCookie('name', { path: '/admin' });

    // --------------- res.download(path [, filename] [, options] [, fn])

    // передает файл path как 'atachment'
    // этот метод использует res.sendFile() для передачи файла, options передается в res.sendFile()
    // filename имя показываемое клиенту в браузере
    // fn используется для обработки ошибок
    res.download('/report-12345.pdf')
    res.download('/report-12345.pdf', 'report.pdf')
    res.download('/report-12345.pdf', 'report.pdf', function (err) {
        if (err) {
            // Handle error, but keep in mind the response may be partially-sent so check res.headersSent
        } else {
            // decrement a download credit, etc.
        }
    })

    // --------------- res.end([data] [, encoding])

    // быстро завершить ответ без каких-либо данных
    res.status(404).end();

    // --------------- res.format(object)

    // обработка в соответсвии с HTTP заголовком Accept
    // использует req.accepts() для выбора обработчика запроса 
    // если заголовок не указан, вызывается первый обратный вызов
    // если совпадений не найдено, сервер отвечает 406 «Not Acceptable» или вызывает default
    // Content-Type ответа устанавливается при выборе обратного вызова, может быть изменен res.set() или res.type()
    res.format({
        // text
        'text/plain': function () {
            res.send('hey')
        },
        // html
        'text/html': function () {
            res.send('<p>hey</p>')
        },
        // json
        'application/json': function () {
            res.send({ message: 'hey' })
        },
        default: function () {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable')
        }
    })

    // --------------- res.get(field)

    // возвращает заголовок http
    res.get('Content-Type');

    // --------------- res.json([body])

    // отправляет json ответ
    res.json(null);
    res.json({ user: 'tobi' });
    res.status(500).json({ error: 'message' });

    // --------------- res.jsonp([body])

    // ответ с поддержкой JSONP
    res.jsonp(null);                                // => callback(null)
    res.jsonp({ user: 'tobi' });                    // => callback({ "user": "tobi" })
    app.set('jsonp callback name', 'cb');           // ?cb=foo
    res.status(500).jsonp({ error: 'message' });    // => foo({ "error": "message" })

    //      https://msiter.ru/tutorials/javascript/js_json_jsonp
    //      https://learn.javascript.ru/ajax-jsonp

    // --------------- res.links(links)

    // заполняет HTTP заголовок Link, эквивалентный элементу HTML <link>
    res.links({
        next: 'http://api.example.com/users?page=2',
        last: 'http://api.example.com/users?page=5'
    });
    // Link: <http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last"

    //      https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link

    // --------------- res.location(path)

    // устанавливает HTTP заголовок Location 
    res.location('/foo/bar');
    res.location('http://example.com');

    // значение 'back' соответствует значению заголовка Referer в запросе или '/' если Referer не задан
    res.location('back');

    //      https://en.wikipedia.org/wiki/HTTP_referer

    // --------------- res.redirect([status,] path)

    // перенаправляет запрос на другой адрес
    // status по умолчанию 302
    res.redirect('/foo/bar');
    res.redirect('http://example.com');
    res.redirect(301, 'http://example.com');
    res.redirect('../login');
    res.redirect('back');

    // --------------- res.render(view [, locals] [, callback])

    // визуализирует viewи отправляет визуализированную строку HTML клиенту
    // locals - объект, свойства которого определяют локальные переменные для представления
    // callback - обрабатывает визуализированную строку HTML и ошибку визуализации, но не выполняет автоматический ответ, next(err) вызывается изнутри

    // send the rendered view to the client
    res.render('index');

    // if a callback is specified, the rendered HTML string has to be sent explicitly
    res.render('index', function (err, html) {
        res.send(html);
    })

    // pass a local variable to the view
    res.render('user', { name: 'Tobi' }, function (err, html) {
        res.send(html);
    })

    //      http://expressjs.com/en/guide/using-template-engines.html

    // --------------- res.send([body])

    // отправляет http ответ
    res.send(Buffer.from('<p>some html</p>'));      // Content-Type = 'application/octet-stream'
    res.send('<p>some html</p>');                   // Content-Type = 'text/html'
    res.send({ some: 'json' });                     // JSON
    res.send([1, 2, 3]);                            // JSON

    // --------------- res.sendFile(path [, options] [, fn])

    // передает файл по указанному пути
    // если root не указан, то path должен быть абсолютным

    //      https://github.com/pillarjs/send
    //      https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Accept-Ranges
    //      https://javascript.plainenglish.io/serving-static-files-in-express-apps-with-serve-static-f42aaa2d6c2b

    let sendOption = {
        'maxAge': 900000,           // свойство max-age заголовка Cache-Control в миллисекундах или строка в формате ms
        'root': '',                 // корневой каталог для относительных имен файлов
        'lastModified': true,       // Last-Modified заголовок
        'headers': {},              // объект с заголовками http
        'dotfiles': 'ignore',       // 'allow', deny', 'ignore' - обслуживание файлов начинающихся с символа '.'
        'acceptRanges': false,      // 
        'cacheControl': false,      // заголовок Cache-Control
        'immutable': false,         // immutable в заголовке Cache-Control ответа
    };

    app.get('/user/:uid/photos/:file', function (req, res, next) {

        let options = {
            root: path.join(__dirname, 'public'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        }

        let uid = req.params.uid;
        let file = req.params.file;
        let fileName = '/uploads/' + uid + '/' + file;
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        })
    })

    // --------------- res.sendStatus(statusCode)

    // утсанавливает HTTP status code в statusCode
    res.sendStatus(200);    // equivalent to res.status(200).send('OK')
    res.sendStatus(403);    // equivalent to res.status(403).send('Forbidden')
    res.sendStatus(404);    // equivalent to res.status(404).send('Not Found')
    res.sendStatus(500);    // equivalent to res.status(500).send('Internal Server Error')

    //      https://en.wikipedia.org/wiki/List_of_HTTP_status_codes

    // --------------- res.set(field [, value])

    // устанавливает http заголовки
    res.set('Content-Type', 'text/plain')
    res.set({
        'Content-Type': 'text/plain',
        'Content-Length': '123',
        ETag: '12345'
    })

    // --------------- res.status(code)

    // устанавливает статус HTTP ответа
    res.status(403).end();
    res.status(400).send('Bad Request');
    res.status(404).sendFile('/absolute/path/to/404.png');

    // --------------- res.type(type)

    // устанавливает тип MIME для HTTP заголовка Content-Type
    // метод express.serveStatic.mime.lookup() используется для определения MIME типов
    res.type('.html');              // => 'text/html'
    res.type('html');               // => 'text/html'
    res.type('json');               // => 'application/json'
    res.type('application/json');   // => 'application/json'
    res.type('png');                // => 'image/png'

    // --------------- res.vary(field)

    // добавляет значение в заголовок Vary
    res.vary('User-Agent').render('docs');

    //      https://www.fastly.com/blog/best-practices-using-vary-header
    //      https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Vary

    // --------------- 

    //      https://nodejs.org/api/http.html#http_class_http_serverresponse
})

// --------------- --------------- --------------- Router

// представляет собой изолированный экземпляр промежуточного программного обеспечения и маршрутов
// каждое приложение Express имеет встроенный маршрутизатор приложений
// маршрутизатор ведет себя как промежуточное ПО, поэтому вы можете использовать его как аргумент для app.use() или use() другого маршрутизатора

// --------------- router.all(path, [callback, ...] callback)

// выполнение глобальной логики в рамках роутера, соответствует всем типам запросов

// --------------- router.METHOD(path, [callback, ...] callback)

// один из методов HTTP, таких как GET, PUT, POST и т.д.
router.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function (req, res) {
    let from = req.params[0]
    let to = req.params[1] || 'HEAD'
    res.send('commit range ' + from + '..' + to)
})

// --------------- router.param(name, callback)

// функция работает аналогично app.param

// добавляет триггеры обратного вызова к параметрам маршрута, где name - имя параметра, а callback - функция обратного вызова

// параметры функции обратного вызова:
// req - объект запроса
// res - объект ответа.
// next - указывает на следующую функцию промежуточного программного обеспечения
// value - значение name параметра
// name - имя параметра

router.param('user', function (req, res, next, id) {
    // try to get the user details from the User model and attach it to the request object
    User.find(id, function (err, user) {
        if (err) {
            next(err);
        } else if (user) {
            req.user = user;
            next();
        } else {
            next(new Error('failed to load user'));
        }
    })
})

// --------------- router.route(path)

// функция аналогична app.router

// возвращает экземпляр одного маршрута, который затем можно использовать для обработки HTTP-команд с необязательным промежуточным программным обеспечением
// используйте, router.route() чтобы избежать дублирования имен маршрутов

// --------------- router.use([path], [function, ...] function)

// функция аналогична app.use

// --------------- --------------- --------------- 

//
app.disable('etag');
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Cache-Control', 'no-store');
    next();
});

// --------------- app.listen([port[, host[, backlog]]][, callback])

// связывает приложение express с портом
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

//      https://nodejs.org/api/http.html#http_server_listen

// ---------------

// связанные ссылки:
//      https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
//      https://expressjs.com/ru/advanced/best-practice-performance.html
