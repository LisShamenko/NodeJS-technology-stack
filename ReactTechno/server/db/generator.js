// --- ESM

// ошибка при использовании `import { ... } from ' ... '`
//      Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
//      
//      Решение:
//      - добавить строку `"type": "module"` в файл package.json
//      - использовать флаг '--experimental-modules' при вызове nodejs:
//          node --experimental-modules app.js
//      - альтернативный вариант, переименовать файл app.js в app.mjs

// ошибка: __dirname is not defined in ES module scope
//      https://nodejs.org/api/esm.html#no-__filename-or-__dirname
//
//      const url = require('url');
//      const __filename = url.fileURLToPath(import.meta.url);
//      const __dirname = path.dirname(__filename);

// --- пакеты

// Запуск:
//      node './ReactTechno/server/db/generator.js'
//      node './ReactTechno/server/db/generator.js' users=10 posts=20 comments=40 likes=80

// 
const path = require('path');
const fs = require('fs');
const util = require('util');
const faker = require('faker');
const starwars = require('starwars');
const starWarsWords = require('forcem-ipsum');
const lodash = require('lodash');
const uuid = require('uuid');
const terminalKit = require('terminal-kit');

// 
const { sample, random: rand } = lodash;
const { date } = faker;
const { v4 } = uuid;
const { terminal } = terminalKit;

// 
const User = require('./models/User');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Post = require('./models/Post');

// --- настройка

const map = new Map();
map["users"] = 10;
map["posts"] = 50;
map["comments"] = 75;
map["likes"] = 50;

// 
process.argv.forEach(function (val, index, array) {
    let values = val.split('=');
    if (values.length === 2) {
        let property = values[0];
        let value = values[1];
        if (map.hasOwnProperty(property)) {
            map[property] = value;
        }
    }
});

// 
let progress = 0;
const progressBar = terminal.progressBar({
    width: map["users"] + map["posts"] + map["comments"] + map["likes"],
    title: '--- progress: ',
    eta: true,
    percent: true
});

// 
function updateProgress() {
    progress++;
    progressBar.update(progress);
}

// --- Генератор контента.

// 
function generateName() {
    let result = starWarsWords('characters', 1);
    return result[0];
}

// 
function generateText() {
    let result = starWarsWords(sample(['e4', 'e5', 'e6']), 1);
    return result[0];
}

// 
function generateDate() {
    let day = sample([1, 2, 3, 4, 5, 6, 7]);
    return date.recent(day);
}

// 
function generateTime() {
    let day = sample([1, 2, 3, 4, 5, 6, 7]);
    let newDate = date.recent(day);
    return new Date(newDate).getTime();
}

// 
function getPictures(count, base) {
    const pics = [];
    for (let i = 0; i <= count; i++) {
        pics.push(`${base}/${i}.jpeg`);
    }
    return pics;
}

// Генератор лайков.
function generateLikes(count, posts, users) {
    const likes = [];
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < rand(0, users.length); j++) {

            // 
            const user = lodash.sample(users);
            const post = lodash.sample(posts);
            const like = new Like({
                id: v4(),
                userId: user.id,
                postId: post.id
            });

            // 
            post.likes.push(like.id);
            likes.push(like);
            updateProgress();
        }
    }
    return likes;
}

// Генератор комментариев.
function generateComments(count, users, posts) {
    const comments = [];
    for (let i = 0; i < count; i++) {

        // 
        const user = sample(users);
        const post = sample(posts);
        const comment = new Comment({
            id: v4(),
            userId: user.id,
            postId: post.id,
            date: generateDate(),
            content: generateText()
        });

        // 
        post.comments.push(comment.id);
        comments.push(comment);
        updateProgress();
    }
    return comments;
}

// Генератор постов.
function generatePosts(count, users, pictures) {
    const posts = [];
    for (let i = 0; i < count; i++) {

        // 
        const user = sample(users);
        const post = new Post({
            id: v4(),
            userId: user.id,
            content: starwars(),
            date: generateTime(),
            likes: [],
            image: sample(pictures),
        });

        //
        posts.push(post);
        updateProgress();
    }
    return posts;
}

// Генерация пользователей.
async function generateUsers(count, pics) {
    return await Promise.all([...Array(count).keys()].map(
        async () => {
            updateProgress();
            return new User({
                id: v4(),
                name: generateName(),
                image: sample(pics)
            });
        }
    ));
}

// Генератор данных.
(async function generateData() {
    try {

        // 
        const userPics = getPictures(3, '/static/images/users');
        const postPics = getPictures(3, '/static/images/posts');

        // 
        const users = await generateUsers(map["users"], userPics);
        const posts = generatePosts(map["posts"], users, postPics);
        const comments = generateComments(map["comments"], users, posts);
        const likes = generateLikes(map["likes"], posts, users);

        // 
        const write = util.promisify(fs.writeFile);
        await Promise.all([
            write(
                path.join(__dirname, 'data', 'db.json'),
                JSON.stringify({ users, posts, comments, likes })
            )
        ]);

        // 
        console.log(`
            --- complete:
            - ${users.length} users
            - ${posts.length} posts
            - ${comments.length} comments
            - ${likes.length} likes
        `);
    }
    catch (err) {
        console.error(`
            --- error:
            - ${err}
        `);
    }
})();