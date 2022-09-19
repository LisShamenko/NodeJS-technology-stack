"use strict"

// --------------- express

const express = require('express');
const app = express();

// --------------- static

// статический каталог: fallthrough / index / setHeaders
// curl --request GET http://localhost:3000/folder_1/
// curl --request GET http://localhost:3000/.test_dotfile
// curl --request GET http://localhost:3000/1.png
app.use(express.static(
    __dirname + '\\public\\test_1',
    {
        //'dotfiles': 'ignore',
        //'extensions': ['html', 'htm'],
        'fallthrough': true,
        'index': 'index.html',
        'setHeaders': setHeadersFunc,
    }));

// статический каталог: extensions / dotfiles / redirect
// curl --request GET http://localhost:3000/folder_2/
// curl --request GET http://localhost:3000/.test_dotfile
// curl --request GET http://localhost:3000/2.png
// curl --request GET http://localhost:3000/test_ext_2
app.use(express.static(
    __dirname + '\\public\\test_2',
    {
        'dotfiles': 'allow',
        'fallthrough': true,
        'extensions': ['html', 'ext1'],
        'redirect': true,
        'setHeaders': setHeadersFunc,
    }));

// статический каталог: etag / immutable / lastModified / maxAge 
// curl --request GET http://localhost:3000/3.png
app.use(express.static(
    __dirname + '\\public\\test_3',
    {
        'etag': true,
        'immutable': true,
        'lastModified': true,
        'maxAge': '1d',
        'fallthrough': true,
        'setHeaders': setHeadersFunc,
    }));

function setHeadersFunc(res, path, stat) {

    // кастомные заголовки
    res.set('x-timestamp', Date.now());

    // опции [etag, immutable, lastModified, maxAge] еще не установили заголовки
    console.log('--------------------------------');
    console.log('url test: ' + res.req.originalUrl);
    for (const key in res._headers) {
        if (Object.hasOwnProperty.call(res._headers, key)) {
            console.log('header: ' + key + ' --- value = ' + res._headers[key]);
        }
    }
}

// --------------- json, raw, text, urlencoded

// парсинг json: reviver / strict / type / verify

// curl --header "Content-Type: application/json" --request POST --data "{\"username\":\"xyz\",\"password\":\"xyz\"}" http://localhost:3000/tests/json/
app.use(express.json({
    reviver: (key, value) => {
        // парсинг: коррекция данных после парсинга 
        let newValue = typeof value === 'number' ? value * 2 : value;
        console.log('key = ' + key + ' ---  old value = ' + value + ' --- new value = ' + newValue);
        return newValue;
    },
    strict: false,
    //inflate: true,
    //limit: 1024 * 1024,
    type: 'application/json',
    verify: (req, res, buf, encoding) => {
        console.log(`EXPRESS --- JSON --- buf = ${buf} --- encoding = ${encoding}`);
    },
}));
app.post('/tests/json', function (req, res, next) {
    res.send(getPBQ(req));
});

// curl --header "Content-Type: application/octet-stream" --request POST --data-binary "@C:\octetfFile.json" http://localhost:3000/tests/raw_or_text/
app.use(express.raw({
    //inflate: true,
    //limit: 1024 * 1024,
    type: 'application/octet-stream',
    verify: (req, res, buf, encoding) => {
        console.log(`EXPRESS --- RAW --- buf = ${buf} --- encoding = ${encoding}`);
    },
}));

// curl --header "Content-Type: text/plain" --request POST --data-raw "{\"param1\":1,\"param2\":\"str\",\"param3\":true}" http://localhost:3000/tests/raw_or_text/
app.use(express.text({
    defaultCharset: 'utf-8',
    //inflate: true,
    //limit: 1024 * 1024,
    type: 'text/plain',
    verify: (req, res, buf, encoding) => {
        console.log(`EXPRESS --- TEXT --- buf = ${buf} --- encoding = ${encoding}`);
    },
}));

app.post('/tests/raw_or_text', function (req, res, next) {
    try {
        res.json(JSON.parse(req.body.toString()));
    }
    catch (e) {
        res.json(e);
    }
});

// curl --header "Content-Type: application/x-www-form-urlencoded" --request POST --data-urlencode "param1=1" --data-urlencode "param2=str" --data-urlencode "param3=true" http://localhost:3000/tests/urlencoded/ 
app.use(express.urlencoded({
    extended: true,
    parameterLimit: 1000,
    //inflate: true,
    //limit: 1024 * 1024,
    type: 'application/x-www-form-urlencoded',
    verify: (req, res, buf, encoding) => {
        console.log(`EXPRESS --- URLENCODED --- buf = ${buf} --- encoding = ${encoding}`);
    },
}));

app.post('/tests/urlencoded', function (req, res, next) {
    try {
        res.json(req.body);
    }
    catch (e) {
        res.json(e);
    }
});

// --------------- sub-app

// curl --request GET http://localhost:3000/admin/secret/
let secret = express();
secret.get('/', function (req, res) {
    console.log(secret.mountpath);
    res.send('Admin Secret');
})
secret.on('mount', function (parent) {
    console.log('Secret Mounted --- ' + parent);
});

// curl --request GET http://localhost:3000/admin/
// curl --request GET http://localhost:3000/manager/
let admin = express();
admin.get('/', function (req, res) {
    console.log(admin.mountpath);
    res.send('Admin Homepage');
})
admin.on('mount', function (parent) {
    console.log('Admin Mounted --- ' + parent);
});

// 
admin.use('/secret', secret);
app.use(['/admin', '/manager'], admin);

// 
console.dir('path secret = ' + secret.path());
console.dir('path admin = ' + admin.path());
console.dir('path app = ' + app.path());

// --------------- app pipeline

// curl --request DELETE http://localhost:3000/pipeline/first_req/
// curl --request GET http://localhost:3000/pipeline/first_req/
// curl --request POST http://localhost:3000/pipeline/first_req/
// curl --request PUT http://localhost:3000/pipeline/first_req/
app.all('/pipeline/*',
    function (req, res, next) {
        console.log('first ...');
        next();
    },
    function (req, res, next) {
        console.log('second ...');
        next();
    }
);
app.delete('/pipeline/first_req', function (req, res) {
    res.send('DELETE request to homepage');
});
app.get('/pipeline/first_req', function (req, res) {
    res.send('GET request to homepage');
});
app.post('/pipeline/first_req', function (req, res) {
    res.send('POST request to homepage');
});
app.put('/pipeline/first_req', function (req, res) {
    res.send('PUT request to homepage');
});

// --------------- sub routers

let router = express.Router({
    'caseSensitive': false,
    'mergeParams': false,
    'strict': false,
});

router.param('user', function (req, res, next, id) {
    req.user = { id: id, };
    console.log('sub_router --- param --- id = ' + id);
    next();
})

// curl --request GET http://localhost:3000/sub_router/1000/
router.use(function (req, res, next) {
    console.log('sub_router --- use');
    next();
});
router.all('/:user/', function (req, res, next) {
    console.log('sub_router --- all');
    next();
});
router.get('/:user/', function (req, res, next) {
    console.log('sub_router --- get');
    res.send('ok');
});
router.post('/:user/', function (req, res, next) {
    console.log('sub_router --- post');
    res.send('ok');
});

// curl --request GET http://localhost:3000/sub_router/commits/71dbb9c..4c084f9
router.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function (req, res) {
    console.log(`commit range ---  ${req.params[0]} --- ${req.params[1]} ---`);
    res.send(`commit range ---  ${req.params[0]} --- ${req.params[1]} ---`);
});

// curl --request GET http://localhost:3000/sub_router/1000/sub_sub_router/
router.route('/:user/sub_sub_router')
    .get(function (req, res, next) {
        console.log('sub_router --- sub_sub_router --- get');
        res.send('ok');
    });

app.use('/sub_router', router);

// --------------- app param

// встроенная функция проверки параметров
app.param(['id', 'page', 'user'], function (req, res, next, value, key) {
    if (req.user === undefined) {
        req.user = {};
    }
    req.user[key] = value;
    console.log(`app --- param --- key = ${key} --- value = ${value}`);
    next();
});

// кастомная функция проверки параметра
app.param(function (param, option) {
    return function (req, res, next, value, key) {
        if (value === option.id ||
            option.validator && option.validator(value)) {
            next();
        }
        else {
            next('route');
        }
    }
});

// опции для кастомной проверки
app.param('id', {
    id: 1000,
    validator: function (candidate) {
        return !isNaN(parseFloat(candidate)) && isFinite(candidate);
    }
});

// curl --request GET http://localhost:3000/user/1000/1/
app.get('/user/:id/:page', function (req, res, next) {
    console.log('app --- user');
    next();
});
app.get('/user/:id/:page', function (req, res) {
    console.log('app --- user --- after next()');
    res.end();
});

// curl --request GET http://localhost:3000/user/1000/
app.get('/user/:id', function (req, res) {
    res.send('ok')
});

// --------------- app use error

// curl --request GET http://localhost:3000/throw_error
app.use(function (req, res, next) {
    console.log('before error --- Time: %d', Date.now());
    next();
});

app.get('/throw_error', function (req, res) {
    throw Error('error for test');
});

// функция для перехвата и обработки ошибок
app.use(function (err, req, res, next) {
    console.log('after error --- Time: %d', Date.now());
    res.status(500).send(err.stack);
});

// --------------- app use CORS

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Cache-Control', 'no-store');
    next();
});

// --------------- sub app routers

// curl --request GET http://localhost:3000/sub_app_router/
// curl --request POST http://localhost:3000/sub_app_router/
app.route('/sub_app_router')
    .all(function (req, res, next) {
        console.log('sub_app_router --- all');
        next();
    })
    .get(function (req, res, next) {
        console.log('sub_app_router --- get');
        res.send('ok');
    })
    .post(function (req, res, next) {
        console.log('sub_app_router --- post');
        res.send('ok');
    })

// --------------- app.engine / app.render

const path = require('path');
const ejs = require('ejs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', ejs.renderFile)

// curl --header "Accept: text/plain" --request GET http://localhost:3000/users
// curl --header "Accept: text/html" --request GET http://localhost:3000/users
// curl --header "Accept: application/json" --request GET http://localhost:3000/users
app.get('/users', function (req, res) {

    let users = [
        { id: 1000, name: 'admin' },
        { id: 999, name: 'guest' },
    ];

    res.format({
        // text
        'text/plain': function () {
            res.send('users');
        },
        // html
        'text/html': function () {
            res.render('users', { users: users, title: 'users' });
            //res.render('users', { users: users }, function (err, html) { res.send(html); });
            //app.render('users', { cache: true, users: users }, function (err, html) { res.send(html); });
            //res.render('index');
            //res.render('index', function (err, html) { res.send(html); })
            //res.render('user', { name: 'Tobi' }, function (err, html) { res.send(html); })
        },
        // json
        'application/json': function () {
            res.json(users);
        },
        default: function () {
            res.status(406).send('Not Acceptable');
        }
    });
});

// --------------- app

app.locals.title = 'My App';
console.dir('locals.title = ' + app.locals.title);

app.locals.email = 'me@myapp.com';
console.dir('locals.email = ' + app.locals.email);

app.disable('trust proxy');
console.dir('trust proxy is disabled = ' + app.disabled('trust proxy'));

app.enable('trust proxy');
console.dir('trust proxy is enabled = ' + app.enabled('trust proxy'));

app.set('title', 'My Site');
console.dir('title = ' + app.get('title'));

// --------------- параметры express приложения

// УСТАНАВЛИВАТЬ ПО НЕОБХОДИМОСТИ

// app.set('case sensitive routing', undefined);
// app.set('env', process.env.NODE_ENV | 'production');
// app.set('etag', 'weak'); // app.disable('etag');
// app.set('jsonp callback name', 'callback');
// app.set('json escape', undefined);
// app.set('json replacer', (key, value) => (typeof value === 'string') ? undefined : value);
// app.set('json spaces', undefined);
// app.set('query parser', 'extended ');
// app.set('strict routing', undefined);
// app.set('subdomain offset', 2);
// app.set('trust proxy', false);
// app.set('views', process.cwd() + '/views');
// app.set('view cache', undefined);
// app.set('view engine', undefined);
// app.set('x-powered-by', true); // app.disable('x-powered-by');

// --------------- request

// curl -g --request GET "http://localhost:3000/request/url_params?q=tobi+ferret&shoe[color]=blue&shoe[type]=converse&color[]=blue&color[]=black&color[]=red"
app.get('/request/url_params', function (req, res) {

    console.log('приложение express --- app = ' + req.app);
    console.log('папка viewa --- app.get("views") = ' + req.app.get('views'));
    console.log('тело запроса --- body = ' + req.body);
    console.dir('cookie --- cookies.name = ' + (req.cookies && req.cookies.name));
    console.dir('подписанные cookie --- signedCookies = ' + req.signedCookies);
    console.dir('подписанные cookie --- signedCookies.user = ' + (req.signedCookies && req.signedCookies.user));
    console.dir('актуальность кэша --- fresh = ' + req.fresh);
    console.log('не актуальность кэша --- stale = ' + req.stale);
    console.dir('имя хоста --- hostname = ' + req.hostname);
    console.dir('адрес запроса --- ip = ' + req.ip);
    console.dir('адреса прокси --- ips = ' + req.ips);
    console.dir('http метод --- method = ' + req.method);
    console.dir('url = ' + req.url);
    console.dir('исходный адрес запроса --- originalUrl = ' + req.originalUrl);
    console.dir('baseUrl = ' + req.baseUrl);
    console.dir('маршрут запроса --- path = ' + req.path);
    console.dir('протокол --- protocol = ' + req.protocol);
    console.log('совпадающий маршрут --- route = ' + req.route);
    console.log('TLS соединение --- secure = ' + req.secure);
    console.dir('субдомены в адресе --- subdomains = ' + req.subdomains);
    console.dir('отправлен XMLHttpRequest --- xhr = ' + req.xhr);

    // 
    console.dir('q=tobi+ferret --- ' + req.query.q);
    console.dir('shoe[color]=blue --- ' + req.query.shoe.color);
    console.dir('shoe[type]=converse --- ' + req.query.shoe.type);
    console.dir('color[]=blue&color[]=black&color[]=red --- ' + req.query.color);
    console.dir(req.params.name);
    console.dir(req.params[0]);

    res.send('ok');

});

app.get('/request/accepts', function (req, res) {

    // curl --header "Accept: text/html" --request GET http://localhost:3000/request/accepts
    // curl --header "Accept: text/*, application/json" --request GET http://localhost:3000/request/accepts
    // curl --header "Accept: text/*;q=.5, application/json" --request GET http://localhost:3000/request/accepts
    console.log('Accept: text/html --- MIME = html --- ' + req.accepts('html'));
    console.log('Accept: text/*, application/json --- MIME = html --- ' + req.accepts('html'));
    console.log('Accept: text/*, application/json --- MIME = text/html --- ' + req.accepts('text/html'));
    console.log('Accept: text/*, application/json --- MIME = json | text --- ' + req.accepts(['json', 'text']));
    console.log('Accept: text/*, application/json --- MIME = application/json --- ' + req.accepts('application/json'));
    console.log('Accept: text/*, application/json --- MIME = image/png --- ' + req.accepts('image/png'));
    console.log('Accept: text/*, application/json --- MIME = png --- ' + req.accepts('png'));
    console.log('Accept: text/*;q=.5, application/json --- MIME = html | json --- ' + req.accepts(['html', 'json']));

    // req.acceptsCharsets(charset [, ...])
    // req.acceptsEncodings(encoding [, ...])
    // req.acceptsLanguages(lang [, ...])
});

app.post('/request/is', function (req, res) {

    console.log('Content-Type = ' + req.get('Content-Type'));
    console.log('content-type = ' + req.get('content-type'));
    console.log('Something = ' + req.get('Something'));

    // curl --data "{\"data\":\"data\"}" --header "Content-Type: text/html; charset=utf-8" --request POST http://localhost:3000/request/is
    console.log('Content-Type: text/html; charset=utf-8 --- ' + req.is('html'));
    console.log('Content-Type: text/html; charset=utf-8 --- ' + req.is('text/html'));
    console.log('Content-Type: text/html; charset=utf-8 --- ' + req.is('text/*'));

    // curl --data "{\"data\":\"data\"}" --header "Content-Type: application/json" --request POST http://localhost:3000/request/is
    console.log('Content-Type: application/json --- ' + req.is('json'));
    console.log('Content-Type: application/json --- ' + req.is('application/json'));
    console.log('Content-Type: application/json --- ' + req.is('application/*'));
    console.log('Content-Type: application/json --- ' + req.is('html'));

    res.send('ok');

    /*
    // --------------- req.param(name [, defaultValue])

    req.param('name');      // ?name=tobi => "tobi"
    req.param('name');      // POST name=tobi => "tobi"
    req.param('name');      // /user/tobi for /user/:name => "tobi"

    // --------------- req.range(size[, options])

    let range = req.range(1000, { combine: false });
    if (range.type === 'bytes') {
        range.forEach(function (r) {
            console.log('r.start = ' + r.start + ' --- r.end = ' + r.end);
        });
    }
    */
});

// --------------- Response

// curl --request GET http://localhost:3000/response/locals/1000/
app.get('/response/locals/:user', function (req, res) {
    res.locals.user = req.user;
    console.log('res.locals.user = ' + JSON.stringify(res.locals.user));
    res.json(res.locals.user);
});

// curl --request GET http://localhost:3000/response/attachment/
app.get('/response/attachment', function (req, res) {

    console.log('приложение express --- app = ' + res.app);
    console.dir('флаг: заголовки отправлены --- headersSent = ' + res.headersSent);

    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
    res.append('Warning', '199 Miscellaneous warning');

    // вложение дает команду браузеру скачать файл а не отобразить во вкладке 
    res.attachment();
    let attObj = res.attachment('1.png');
    console.log('attachment object --- ' + attObj);
    console.log('Content-Disposition = ' + res.get('Content-Disposition'));
    console.log('Content-Type = ' + res.get('Content-Type'));

    // res.attachment не отправляет файл автоматически
    res.sendFile(path.join(__dirname, 'public/test_1/1.png'));
});

// curl --request GET http://localhost:3000/response/download/
app.get('/response/download', function (req, res) {
    //res.download('/report-12345.pdf')
    //res.download('/report-12345.pdf', 'report.pdf')
    res.download(path.join(__dirname, 'public/test_1/1.png'), 'report.pdf', function (err) {
        if (err) {
            console.log('download --- err = ' + err);
        }
        else {
            console.log('download --- ok');
        }
    })
});

// 
const cookieParser = require('cookie-parser');
app.use(cookieParser('secret'));

// curl --request GET http://localhost:3000/response/cookie/
app.get('/response/cookie', function (req, res) {

    let cookieOption = {
        'domain': '.example.com',
        'path': '/admin',
        'expires': new Date(Date.now() + 900000),
        'maxAge': 900000,
        'httpOnly': true,
        'secure': true,
        'encode': String,
        'signed': true,
        'sameSite': false,
    };

    res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com' });
    res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com', encode: String });
    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });

    res.cookie('name', 'tobi', { signed: true });
    res.clearCookie('name', { path: '/admin' });

    res.status(200).end();
});

// curl --header "Accept: text/plain" --request GET http://localhost:3000/response/format
// curl --header "Accept: text/html" --request GET http://localhost:3000/response/format
// curl --header "Accept: application/json" --request GET http://localhost:3000/response/format
app.get('/response/format', function (req, res) {

    res.format({
        // text
        'text/plain': function () {
            res.send('hey');
        },
        // html
        'text/html': function () {
            res.send('<p>hey</p>');
        },
        // json
        'application/json': function () {
            res.send({ message: 'hey' });
        },
        default: function () {
            res.status(406).send('Not Acceptable');
        }
    })
});

// curl --request GET http://localhost:3000/response/json/1
app.get('/response/json/:mode', function (req, res) {

    res.links({
        next: 'http://api.example.com/users?page=2',
        last: 'http://api.example.com/users?page=5'
    });

    switch (req.params.mode) {
        case '1': res.json(null); break;
        case '2': res.json({ user: 'tobi' }); break;
        case '3': res.status(500).json({ error: 'message' }); break;
        case '4':
            //res.jsonp(null);                                  // => callback(null)
            //res.jsonp({ user: 'tobi' });                      // => callback({ "user": "tobi" })
            app.set('jsonp callback name', 'cb');               // ?cb=foo
            res.status(500).jsonp({ error: 'message' });        // => foo({ "error": "message" })
            break;

        case '5': res.send(Buffer.from('<p>some html</p>')); break;     // Content-Type = 'application/octet-stream'
        case '6': res.send('<p>some html</p>'); break;                  // Content-Type = 'text/html'
        case '7': res.send({ some: 'json' }); break;                    // JSON
        case '8': res.send([1, 2, 3]); break;                           // JSON

        case '9': res.sendStatus(200); break;       // equivalent to res.status(200).send('OK')
        case '10': res.sendStatus(403); break;      // equivalent to res.status(403).send('Forbidden')
        case '11': res.sendStatus(404); break;      // equivalent to res.status(404).send('Not Found')
        case '12': res.sendStatus(500); break;      // equivalent to res.status(500).send('Internal Server Error')

        case '13': res.status(403).end(); break;
        case '14': res.status(400).send('Bad Request'); break;
        case '15': res.status(404).sendFile('/absolute/path/to/404.png'); break;

        default: res.send('ok'); break;
    }
});

// curl --request GET http://localhost:3000/response/options/1/file
app.get('/response/options/:uid/:file', function (req, res, next) {

    let sendOption = {
        'maxAge': 900000,
        'root': '',
        'lastModified': true,
        'headers': {},
        'dotfiles': 'ignore',
        'acceptRanges': false,
        'cacheControl': false,
        'immutable': false,
    };

    let options = {
        root: path.join(__dirname, 'public/test_1'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    let uid = req.params.uid;
    let file = req.params.file;
    let fileName = '/uploads/' + uid + '/' + file;
    res.sendFile('1.png', options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    })
});

// curl --request GET http://localhost:3000/response/redirect/5
app.get('/response/redirect/:mode', function (req, res) {

    res.location('/foo/bar');
    res.location('http://example.com');
    res.location('back');

    switch (req.params.mode) {
        case '1': res.redirect('/foo/bar'); break;
        case '2': res.redirect('http://example.com'); break;
        case '3': res.redirect(301, 'http://example.com'); break;
        case '4': res.redirect('../login'); break;
        case '5': res.redirect('back'); break;
        default: res.send('ok'); break;
    }
});

// curl --request GET http://localhost:3000/response/content-type/5
app.get('/response/content-type/:mode', function (req, res) {

    res.set('Content-Type', 'text/plain');
    res.set({ 'Content-Type': 'text/plain', 'Content-Length': '123', ETag: '12345' });

    res.type('.html');              // => 'text/html'
    console.log('Content-Type = ' + res.get('Content-Type'));
    res.type('html');               // => 'text/html'
    console.log('Content-Type = ' + res.get('Content-Type'));
    res.type('json');               // => 'application/json'
    console.log('Content-Type = ' + res.get('Content-Type'));
    res.type('application/json');   // => 'application/json'
    console.log('Content-Type = ' + res.get('Content-Type'));
    res.type('png');                // => 'image/png'
    console.log('Content-Type = ' + res.get('Content-Type'));

    // 
    res.type('.html');
    res.vary('User-Agent').render('docs');
});

// --------------- 

app.get('/', function (req, res, next) {
    res.send('<h1>main page</h1>');
});

app.get('/book', function (req, res, next) {
    res.status(200).send('ok');
});

// --------------- listen

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

// --------------- exports

module.exports = app;

// --------------- funcs

// логи: req.params, req.body, req.query
function getPBQ(req) {
    return `
        -------------------- PARAMS \n${getObjectProps(req.params).join('\n')}
        -------------------- BODY \n${getObjectProps(req.body).join('\n')}
        -------------------- QUERY \n${getObjectProps(req.query).join('\n')}`;
}

// логи: свойства объекта
function getObjectProps(obj) {
    let strProps = [];
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            strProps.push(`header: ${key} --- value = ${obj[key]}`);
        }
    }
    return strProps;
}

// --------------- --------------- --------------- ПАКЕТЫ

// --------------- body-parser

//const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// --------------- etag

//app.disable('etag');
//const etag = require('etag');
//app.set('etag', function (body, encoding) { return etag(body); });

// --------------- fresh

//function isFresh(req, res) {
//    return fresh(req.headers, {
//        'etag': res.getHeader('ETag'),
//        'last-modified': res.getHeader('Last-Modified')
//    })
//}

// --------------- serve-static
// --------------- ms

//const ms = require('ms');
//console.log(" --- 2 days = " + ms('2 days') + " --- 1d = " + ms('1d') + " --- 10h = " + ms('10h') + " --- '2.5 hrs' = " + ms('2.5 hrs') + " --- 2h = " + ms('2h') + " --- 1m = " + ms('1m') + " --- 5s = " + ms('5s') + " --- 1y = " + ms('1y') + " --- 100 = " + ms('100') + " --- '-3 days' = " + ms('-3 days') + " --- '-1h' = " + ms('-1h') + " --- '-200' = " + ms('-200'));

// --------------- bytes

//const bytes = require('bytes');
//console.log(bytes('1b'));
//console.log(bytes('1kb'));
//console.log(bytes('1mb'));
//console.log(bytes('1gb'));
//console.log(bytes('1tb'));
//console.log(bytes('1pb'));

// --------------- type-is

//const typeis = require('typeis');
//let mediaType = 'application/json';
//typeis.is(mediaType, ['json']);
//typeis.is(mediaType, ['html', 'json']);
//typeis.is(mediaType, ['application/*']);
//typeis.is(mediaType, ['application/json']);
//typeis.is(mediaType, ['html']);
//function bodyParser(req, res, next) {
//    if (!typeis.hasBody(req)) {
//        return next()
//    }
//    switch (typeis(req, ['urlencoded', 'json', 'multipart'])) {
//        case 'urlencoded': throw new Error('implement urlencoded body parsing')
//        case 'json': throw new Error('implement json body parsing')
//        case 'multipart': throw new Error('implement multipart body parsing')
//        default:
//            res.statusCode = 415
//            res.end()
//            break
//    }
//}

// --------------- querystring

//const querystring = require("querystring");
//const asArray = false;
//app.set("query parser", (qs) => {
//    const parsed = querystring.parse(qs);
//    return Object.entries(parsed).reduce((previous, [key, value]) => {
//        const isArray = Array.isArray(value);
//        if (!asArray && isArray) { value = value[0]; }
//        else if (asArray && !isArray) { value = [value]; }
//        previous[key] = value;
//        return previous;
//    }, {});
//});

// --------------- ejs-locals

// --------------- axios 

const axios = require('axios').default;

const getAxios = async (url) => {
    const res = await axios.get(url);
    console.log(`--- ${url} ---`, res);
}

(async () => {
    await getAxios('http://localhost:3000/folder_1');
    await getAxios('http://localhost:3000/.test_dotfile');
    await getAxios('http://localhost:3000/1.png');
})()