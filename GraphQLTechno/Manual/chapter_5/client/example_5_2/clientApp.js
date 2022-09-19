const express = require('express');
const ejs = require('ejs');
const path = require('path');

// 
module.exports.createClientFetch = async function () {
    return new Promise(async (resolve, reject) => {

        const app = express();

        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));

        app.get('/', function (req, res) {
            res.render('index.ejs');
        });

        let clientPort = 8000;
        app.listen(clientPort, () => {
            console.log(`--- client: http://localhost:${clientPort}`);
            resolve(app);
        });
    });
}