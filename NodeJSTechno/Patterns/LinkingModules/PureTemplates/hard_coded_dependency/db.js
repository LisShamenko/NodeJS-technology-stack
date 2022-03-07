"use strict";

const path = require('path');
const level = require('level');
const sublevel = require('level-sublevel');

const basepath = path.join(__dirname, './../../../dist/25/example-db');

// модуль экспортирует дескриптор базы данных, который является объектом 
//      с состоянием, то есть модуль создает объект ­одиночку
module.exports = sublevel(
    // создает соединение с базой данных LevelDB в каталоге 'example-db', 
    //      получаемый экземпляр декорирован плагином sublevel 
    level(basepath, { valueEncoding: 'json' })
);