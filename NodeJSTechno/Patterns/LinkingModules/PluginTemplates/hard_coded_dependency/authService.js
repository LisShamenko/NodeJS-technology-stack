"use strict";

const db = require('./db');
const users = db.sublevel('users');
const tokenSecret = 'a_token_secret';

const auth_service_functions = require('./../../auth_service_functions');
const functions = auth_service_functions(users, tokenSecret);

exports.login = functions.login_function;
exports.checkToken = functions.check_token_function;
exports.get_user = functions.get_user;