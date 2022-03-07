"use strict";

// обертка http.request для чередования запросов
const request = require('./balancedRequest');

//
async function requestsFromClient() {
    return new Promise(async (resolve, reject) => {

        let j = 0;
        const check = () => {
            j++;
            if (j >= 9) {
                resolve();
            }
        }

        // отправка клиентских запросов
        for (let i = 10; i >= 0; i--) {
            request(
                { method: 'GET', path: `/?i=${i}` },
                res => {
                    let str = '';
                    res
                        .on('data', chunk => {
                            str += chunk;
                        })
                        .on('end', () => {
                            console.log(str);
                            check();
                        });
                }
            ).end();
        }
    });
}

// 
module.exports.requestsFromClient = requestsFromClient;