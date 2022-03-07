const request = require('request');
const async = require('async');

// 
async function getTest(item, port = 3000) {
    return new Promise(async (resolve, reject) => {
        request(`http://localhost:${port}/?item=${item}`, (err, res) => resolve({ err, res }));
    });
}

// 
function parallelRequests(callback) {
    async.parallel([
        function (callback) {
            request(`http://localhost:3000/?i=1`,
                (err, res) => callback(null, { err, res }));
        },
        function (callback) {
            request(`http://localhost:3000/?i=2`,
                (err, res) => callback(null, { err, res }));
        }
    ], function (err, results) {
        results.forEach(item => {
            if (item.err) {
                console.log(`--- err = ${item.err}`);
            }
            if (item.res.body) {
                console.log(`--- res = ${item.res.body}`);
            }
            if (callback) {
                callback();
            }
        });
    });
}

// 
module.exports.getTest = getTest;
module.exports.parallelRequests = parallelRequests;