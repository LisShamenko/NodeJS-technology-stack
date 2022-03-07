"use strict";

// 
const request = require('request');
const http = require('http');

// 
module.exports = async (item = 'item', port = 3000, count = 5, interval = 200) => {
    return new Promise(async (resolve, reject) => {

        // 
        const agent = new http.Agent();
        agent.maxSockets = count;
        let i = 0;

        //
        const timer = setInterval(
            () => {
                i++
                if (i > count) {
                    clearInterval(timer);
                    return resolve();
                }

                // 
                request(
                    {
                        url: `http://localhost:${port}?item=${item}`,
                        pool: agent
                    },
                    (err, res) => {
                        if (err) {
                            console.log(`--- err = ${err}`);
                        }
                        console.log(`--- status = ${res.statusCode} --- body = '${res.body}' --- ${Date.now()}`);
                    }
                );
            },
            interval
        );
    });
}