import express from 'express';

// функция processRequest является функцией-обработчиком запроса
export function processRequest(req: express.Request, res: express.Response) {
    console.log('SimpleModuleHandler.processRequest');
    res.send('Hello World');
};