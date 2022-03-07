"use strict";

const level = require('level');
const sublevel = require('level-sublevel');

// фабрика позволяет создавать и использовать разные экземпляры базы данных, 
//      модуль не поддерживает состояние и его можно использовать повторно 
module.exports = function (dbName) {
    return sublevel(
        level(dbName, { valueEncoding: 'json' })
    );
};
