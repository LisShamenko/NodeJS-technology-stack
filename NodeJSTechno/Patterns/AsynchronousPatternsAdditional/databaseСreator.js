"use strict";

const sublevel = require('level-sublevel');
const level = require('level');
const bcrypt = require('bcrypt');
const async = require('async');



// 
module.exports = (
    dbpath = 'example-db',
    items = ['item'],
    options = { valueEncoding: 'json' }
) => {

    // 
    const DB = level(dbpath, options);
    const subDB = sublevel(DB);
    const salesDb = subDB.sublevel('sales');

    // 
    return {

        // 
        automation: async (creator) => {
            return new Promise(async (resolve, reject) => {
                await creator.addItems(10);
                let res = await creator.get_item(0);
                console.log(`--- ${JSON.stringify(res.item)}`);
                await creator.closeDB();
                resolve();
            });
        },

        // 
        addItems: async function addItems(count) {
            return new Promise(async (resolve, reject) => {

                // 
                async.times(
                    // количество итераций
                    count,
                    // выполняемое действие
                    (number, callback) => {
                        let i = (number >= 5) ? number % 5 : number;
                        salesDb.put(
                            number,
                            {
                                value: Math.random() * 100,
                                item: items[i]
                            },
                            callback);
                    },
                    // обработка результата
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
        closeDB: async () => {
            return new Promise(async (resolve, reject) => {
                DB.close((err) => {
                    if (err) {
                        console.log(`--- error: ${err}`);
                        reject(err);
                    }
                    console.log(`--- creator's DB closed`);
                    resolve();
                });
            });
        },

        // проверка
        get_item: async (number) => {
            return new Promise(async (resolve, reject) => {
                salesDb.get(number, (err, item) => {
                    resolve({ err, item });
                });
            });
        },
    }
}