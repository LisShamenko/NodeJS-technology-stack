"use strict";

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');

// общие функции authController для всех примеров
module.exports = (users, tokenSecret) => {

    return {

        // проверка
        get_user: async (username) => {
            return new Promise(async (resolve, reject) => {
                users.get(username, (err, user) => {
                    resolve({ err, user });
                });
            });
        },

        // фнукция службы login, отвечает за сверку пары имя/пароль пользователя
        //      с информацией в базе данных
        login_function: (username, password, callback) => {
            users.get(username, (err, user) => {
                if (err) return callback(err);

                bcrypt.compare(password, user.hash, (err, res) => {
                    if (err) return callback(err);
                    if (!res) return callback(new Error('Invalid password'));

                    const token = jwt.encode({
                        username: username,
                        expire: Date.now() + 60000 // 3600000
                    }, tokenSecret);

                    callback(null, token);
                });
            });
        },

        // функция службы checkToken, принимает маркер и проверяет его допустимость
        check_token_function: (token, callback) => {
            let userData;
            try {
                //jwt.decode will throw if the token is invalid
                userData = jwt.decode(token, tokenSecret);
                if (userData.expire <= Date.now()) {
                    throw new Error('Token expired');
                }
            }
            catch (err) {
                return process.nextTick(callback.bind(null, err));
            }

            users.get(userData.username, (err, user) => {
                if (err) return callback(err);
                callback(null, { username: userData.username });
            });
        }
    }
}