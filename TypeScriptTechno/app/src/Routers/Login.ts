import * as express from 'express';

let router: express.Router = express.Router();

// обработчик запроса GET, который будет использовать шаблон login.hbs
router.get('/login', (req: express.Request, res: express.Response) => {
    res.render('login', { title: 'Express Login' });
});

// обработчик для запроса POST, когда пользователь заполнит форму и нажмет кнопку отправки
router.post('/login', (req, res, next) => {
    if (req.body.username.length > 0) {
        req.session!['username'] = req.body.username;
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Express',
            ErrorMessage: 'Please enter a user name'
        });
    }
});

export { router };