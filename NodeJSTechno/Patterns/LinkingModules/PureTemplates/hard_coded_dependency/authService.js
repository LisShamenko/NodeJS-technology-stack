"use strict";

// Создание жесткой зависимости с модулем db, обладающим состоянием. В переменной 
//      db сохраняется объект базы данных через который выполняются запросы к базе. 
//      Использование другой базы данных практически невозможно, поскольку код 
//      жестко привязан к одному конкретному экземпляру. Изолированное тестирование 
//      будет затруднено, поскольку сложно создать фиктивный экземпляр базы данных,
//      используемый модулем.

// данная версия authService жестко зависит от одного конкретного экземпляра db
const db = require('./db');
const users = db.sublevel('users');
const tokenSecret = 'a_token_secret';

// 
const auth_service_functions = require('./../../auth_service_functions');
const functions = auth_service_functions(users, tokenSecret);

// authService отвечает за сверку учетных данных пользователя с информацией 
//      в базе данных
exports.login = functions.login_function;
exports.checkToken = functions.check_token_function;
exports.get_user = functions.get_user;