"use strict";

const path = require('path');
const level = require('level');
const sublevel = require('level-sublevel');

const basepath = path.join(__dirname, './../../../dist/30/example-db');

module.exports = sublevel(
    level(basepath, { valueEncoding: 'json' })
);