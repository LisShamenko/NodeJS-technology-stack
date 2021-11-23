import express from 'express';

// Функция Router возвращает один и тот же экземпляр маршрутизатора независимо от того, откуда он был вызван
let router: express.Router = express.Router();

router.get('/index', (req: express.Request, res: express.Response) => {
    // render принимает имя шаблона и простой Java-объект POJO в качестве входных данных для шаблонизатора
    res.render('index', {
        title: 'Express',
        username: req.session!['username']
    });
});

export { router };