"use strict";

// общие функции authController для всех примеров
module.exports = (authService) => {

    // 
    return {

        // прием учетных данных и возврат маркера аутентификации
        login_function: (req, res, next) => {
            authService.login(req.body.username, req.body.password,
                (err, result) => {
                    if (err) {
                        return res.status(401).send({
                            ok: false,
                            error: 'Invalid username/password'
                        });
                    }
                    res.status(200).send({ ok: true, token: result });
                }
            );
        },

        // проверки маркера
        check_token_function: (req, res, next) => {
            authService.checkToken(req.query.token,
                (err, result) => {
                    if (err) {
                        return res.status(401).send({
                            ok: false,
                            error: 'Token is invalid or expired'
                        });
                    }
                    res.status(200).send({ ok: 'true', user: result });
                }
            );
        }
    }
};