"use strict";

module.exports = (serviceLocator) => {

    // 
    const tokenSecret = serviceLocator.get('tokenSecret');
    const db = serviceLocator.get('db');
    const users = db.sublevel('users');

    // 
    const auth_service_functions = require('./../../auth_service_functions');
    const functions = auth_service_functions(users, tokenSecret);
    return {
        login: functions.login_function,
        checkToken: functions.check_token_function,
        get_user: functions.get_user,
    };
};