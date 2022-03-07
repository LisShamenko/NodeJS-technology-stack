"use strict";

const level = require('level');
const sublevel = require('level-sublevel');

module.exports = (serviceLocator) => {
    // использует полученный локатор служб для извлечения имени 
    //      базы данных при создании экземпляра
    const dbName = serviceLocator.get('dbName');
    return sublevel(
        level(dbName, { valueEncoding: 'json' })
    );
};