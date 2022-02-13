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
const chapters = ['TestProject', 'Forms'];

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

// --- маршурты api: post

// REST:
//      - get list      вернуть список элементов    /posts
//      - get item      вернуть элемент             /posts/:id
//      - post item     создать элемент             /posts + body
//      - put item      обновить элемент            /posts/:id + body
//      - delete item   удалить элемент             /posts/:id

// 
app.get('/api/posts', async (req, res, next) => {
    return res.json({ posts: dbJson.posts });
});

// 
app.get('/api/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;

    // 
    let post = dbJson.posts.find((item) => item.id === postId);
    let user = dbJson.users.find((item) => item.id === post.userId);
    let comments = dbJson.comments.filter((item) => item.postId === postId);
    let likes = dbJson.likes.filter((item) => item.postId === postId);

    // 
    comments.forEach(comment => {
        comment.user = dbJson.users.find((item) => item.id === comment.userId);
    });

    //
    return res.json({
        post: post,
        user: user,
        comments: comments,
        likes: likes,
    });
});

//
app.post('/api/posts', async (req, res, next) => {
    const post = req.body;

    //
    let newPost = {
        "id": v4(),
        "userId": post.userId,
        "comments": [],
        "content": post.content,
        "date": Date.now(),
        "image": `/static/images/posts/${lodash.random(0, 2)}.jpg`,
        "likes": [],
    };

    // 
    dbJson.posts.push(newPost)
    return res.json({
        post: newPost
    });
});

//
app.put('/api/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;
    const { content } = req.body;

    //
    let oldPost = dbJson.posts.find((item) => item.id === postId);
    oldPost.content = content;
    return res.sendStatus(200);
});

// 
app.delete('/api/posts/:postId', async (req, res) => {
    const { postId, userId } = req.params;

    // 
    let removePosts = lodash.remove(dbJson.posts,
        (item) => item.id === postId && item.userId === userId);

    // 
    return res.json({
        length: removePosts.length
    });
});

// --- маршурты api: user

// 
app.get('/api/users', (req, res, next) => {
    return res.json({ users: dbJson.users });
});

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