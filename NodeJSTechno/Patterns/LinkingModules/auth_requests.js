const request = require('request');

// 
async function getCheckToken(token) {
    return new Promise(async (resolve, reject) => {
        request.get(
            `http://localhost:3000/checkToken?token=${token}`,
            (err, httpResponse, body) => {
                console.log(`--- error: ${err} --- body: ${body}`);
                //      { ok: false, error: '', user: result }
                resolve({ err: err, body: body });
            }
        );
    });
}

// 
async function postLogin(username, password) {
    return new Promise(async (resolve, reject) => {
        request.post(
            {
                url: 'http://localhost:3000/login',
                json: {
                    username: username,
                    password: password,
                }
            },
            (err, httpResponse, body) => {
                console.log(`--- error: ${err} --- body: ${body}`);
                //      { ok: true, token: result }
                resolve({ err: err, body: body });
            }
        );
    });
}

// 
async function getLogout(token) {
    return new Promise(async (resolve, reject) => {
        request.get(
            `http://localhost:3000/logout?token=${token}`,
            (err, httpResponse, body) => {
                console.log(`--- error: ${err} --- body: ${body}`);
                //      { ok: true }
                resolve({ err: err, body: body });
            }
        );
    });
}

//
module.exports.getCheckToken = getCheckToken;
module.exports.postLogin = postLogin;
module.exports.getLogout = getLogout;