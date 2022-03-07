"use strict";

module.exports = (db, tokenSecret) => {

    //
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