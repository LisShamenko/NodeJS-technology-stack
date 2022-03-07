"use strict";

// модуль не имеет состояния, а экспортирует фабрику, которая принимает 
//      все необходимые модули зависимости
module.exports = (db, tokenSecret) => {

    // зависимости db и tokenSecret стали внедряемыми, что дает возможность 
    //      использовать этот модуль с разными базами и настраивать tokenSecret
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