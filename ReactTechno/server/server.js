// 
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');

// --- config

process.env["NODE_CONFIG_DIR"] = path.join(__dirname, './config');
const config = require('config');
const port = config.get('PORT');
const corsURLs = config.get('CORS');

// --- db

const lodash = require('lodash');
const fetch = require('isomorphic-fetch');
const { v4 } = require('uuid');

// json-файл содержащий фиктивные данные
const routesJson = path.join(__dirname, './db/data/db.json');
const dbJson = require(routesJson);

// --- express

// app
const app = express();

// middlware
app.use(responseTime());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ origin: corsURLs }));

// --- route: static

// делает открытыми все файлы bundle.js
app.use('/',
    express.static(path.resolve(__dirname, './../dist')));

// статические файлы
app.use('/static',
    express.static(path.resolve(__dirname, './../static')));

// route: favicon
//      https://www.npmjs.com/package/serve-favicon
app.use(
    favicon(path.resolve(__dirname, './../static/images/favicon.ico')));

// --- ejs

const ejs = require('ejs');
const { next } = require('cheerio/lib/api/traversing');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const chapters = [];

// 
app.get('/', function (req, res) {

    // 
    if (chapters.includes(req.query.chapter)) {
        return res.render('index', {
            bundle: `./${req.query.chapter}/bundle.js`,
            port: port,
        });
    }
    else {
        return res.render('index', {
            bundle: ``,
            port: port,
        });
    }
});

// --- маркировка

// маркировка всех POST запросов
app.post((req, res, next) => {
    req.body.date = new Date().getTime();
    return next();
});

// --- маршурты api

// --- обработка ошибок

// генерируется ошибка, если маршрут не найден
app.use((req, res, next) => {
    const err = new Error('Route not found.');
    err.status = 404;
    next(err);
});

// обработка всех ошибок
app.use((err, req, res) => {
    console.error('--- Error: ' + err);
    return res.status(err.status || 500).json({
        message: err.message,
    });
});

// обработка ошибок Promise
process.on('unhandledRejection', e => {
    console.error('--- Не обработанная ошибка: ' + e);
});

// --- запуск

//
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

// 
module.exports = app;