"use strict";

// 
const auth_controller_functions = require('./../../auth_controller_functions');

// 
module.exports = {

    // 
    login: (req, res, next) => {

        // зависимость authService была полученна из express приложения
        const authService = req.app.get('authService');

        // одинаковая для всех примеров часть
        const functions = auth_controller_functions(authService);
        functions.login_function(req, res, next);
    },

    // 
    checkToken: (req, res, next) => {

        // зависимость authService была полученна из express приложения
        const authService = req.app.get('authService');

        // одинаковая для всех примеров часть
        const functions = auth_controller_functions(authService);
        functions.check_token_function(req, res, next);
    },

    // 
    get_user: async (app, username) => {
        const authService = app.get('authService');
        return await authService.get_user(username);
    },
};