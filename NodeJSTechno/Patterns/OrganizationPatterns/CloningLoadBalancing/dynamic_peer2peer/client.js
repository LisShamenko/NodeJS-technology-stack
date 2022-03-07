"use strict";

// 
const { apiRequest } = require('./apiRequest');

//
async function requestsFromClient() {
    return new Promise((resolve, reject) => {

        let j = 0;
        const check = () => {
            j++;
            if (j >= 9) {
                resolve();
            }
        }

        // отправка клиентских запросов
        for (let i = 10; i >= 0; i--) {
            apiRequest('/api', (err, res, body) => {
                if (err) {
                    console.log(`--- err = ${err}`);
                    return reject(err);
                }
                console.log(`--- res = ${res.body}`);
                check();
            });
        }
    });
}

//
module.exports.requestsFromClient = requestsFromClient;