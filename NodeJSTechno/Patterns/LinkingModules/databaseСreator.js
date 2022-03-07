"use strict";

const sublevel = require('level-sublevel');
const level = require('level');
const bcrypt = require('bcrypt');
const async = require('async');

// 
module.exports = (dbpath = 'example-db', options = { valueEncoding: 'json' }) => {

    // 
    const db = level(dbpath, options);
    const subdb = sublevel(db);
    const usersDb = subdb.sublevel('users');

    // 
    return {

        // 
        automation: async (creator) => {
            return new Promise(async (resolve, reject) => {

                // 
                await creator.addUsers([
                    { username: 'first', password: 'secret_foo' },
                    { username: 'second', password: 'secret_bar' },
                    { username: 'third', password: 'secret_baz' }
                ]);

                // 
                let result = null;
                result = await creator.get_user('first');
                result = await creator.get_user('second');
                result = await creator.get_user('third');

                // 
                await creator.closeDB();

                // 
                resolve();
            });
        },

        // проверка
        get_user: async (username) => {
            return new Promise(async (resolve, reject) => {
                usersDb.get(username, (err, user) => {
                    resolve({ err, user });
                });
            });
        },

        // 
        closeDB: async () => {
            return new Promise(async (resolve, reject) => {
                db.close((err) => {
                    if (err) {
                        console.log(`--- error: ${err}`);
                        reject(err);
                    }
                    console.log(`--- creator's db closed`);
                    resolve();
                });
            });
        },

        // 
        addUsers: async function addUsers(users) {
            return new Promise(async (resolve, reject) => {

                // 
                async.forEach(
                    users,
                    (user, callback) => {
                        usersDb.put(
                            user.username,
                            {
                                // для тестирования
                                username: user.username,
                                password: user.password,
                                // сохранить hash пароля пользователя, пароли не должны 
                                //      храниться в открытом виде
                                hash: bcrypt.hashSync(user.password, 8)
                            },
                            callback
                        );
                    },
                    (err) => {
                        if (err) {
                            console.log(`--- error: ${err}`);
                            reject(err);
                        }
                        resolve();
                    }
                );
            });
        },

        // 
        addUser: async function addUser(username, password) {
            return new Promise(async (resolve, reject) => {
                usersDb.put(username,
                    {
                        username: username,
                        password: password,
                        hash: password,
                    },
                    (err) => {
                        if (err) {
                            console.log(`--- error: ${err}`);
                        }
                        resolve();
                    }
                );
            });
        },

    }
}