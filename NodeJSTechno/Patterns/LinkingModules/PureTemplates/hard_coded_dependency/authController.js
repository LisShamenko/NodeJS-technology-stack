"use strict";

// Здесь образуется жесткая зависимость от модуля authService, обладающего 
//      состоянием. Модуль authService обладает переходным состоянием, то есть 
//      сам модуль authService косвенно привязан к одному конкретному экземпляру 
//      db. Таким образом, жесткая зависимость пронизывает структуру всего приложения: 
//      authController зависит от authService, который зависит от db. 

// получение зависимости с помощью функции require, которая в данном 
//      случае играет роль сервис локатора
const authService = require('./authService');

// 
const auth_controller_functions = require('./../../auth_controller_functions');
const functions = auth_controller_functions(authService);
module.exports = {
    login: functions.login_function,
    checkToken: functions.check_token_function,
    get_user: authService.get_user,
};