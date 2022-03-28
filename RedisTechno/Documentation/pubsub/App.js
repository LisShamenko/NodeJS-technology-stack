const express = require('express');
const ejs = require('ejs');
const path = require('path');

// 
async function createApp(indexPath, serverPort, clientPort) {
    return new Promise(async (resolve, reject) => {
        const app = express();
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.get('/', function (req, res) {
            res.render(indexPath, {
                serverPort: serverPort,
                clientPort: clientPort
            });
        });
        app.listen(clientPort, () => {
            console.log(`
                --- serverPort ${serverPort}
                --- http://localhost:${clientPort}
            `);
            resolve(app);
        });
    });
}

// 
module.exports.createApp = createApp;