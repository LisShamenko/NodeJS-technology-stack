"use strict";

const authService = require('./authService');

const auth_controller_functions = require('./../../auth_controller_functions');
const functions = auth_controller_functions(authService);
module.exports = {
    login: functions.login_function,
    checkToken: functions.check_token_function,
    get_user: authService.get_user,
};