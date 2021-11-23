// --------------- запуск

// команда запуска в package.json
//      "tsc-project": "tsc --project ./TypeScriptTechno/app/tsconfig.project.json && node ./TypeScriptTechno/app/dist/app.js",
//      "tsc-project": "tsc --project ./TypeScriptTechno/app/tsconfig.project.json",
//      "tsc-project-create-views": "mkdir .\\TypeScriptTechno\\app\\dist\\views",
//      "tsc-project-copy-views": "copy .\\TypeScriptTechno\\app\\src\\views\\ .\\TypeScriptTechno\\app\\dist\\views\\",
//      "tsc-project-delete": "del /q /s .\\TypeScriptTechno\\app\\dist\\*.*",

// команда запуска в консоли
//      npm run tsc-project

// --------------- express приложение

// импорт модуля Express в пространство имен express, 
//      используется экспорт по умолчанию с именем express из библиотеки express
import express from 'express';
import { processRequest } from './Routers/ModuleHandler';
import * as Index from './Routers/Index';
import * as Login from './Routers/Login';

let app = express();

// устанавливаем настройки для файлов layout
//      https://metanit.com/web/nodejs/4.19.php
//      app.engine("hbs", expressHbs({ layoutsDir: "views/layouts", defaultLayout: "layout", extname: "hbs" }))

// Модуль path позволяет использовать несколько удобных функций при работе с путевыми именами каталогов. 
import * as path from 'path';
// установить полный путь к каталогу локальных представлений, где __dirname содержит полный путь к текущему каталогу
//      Handlebars будет по умолчанию использовать глобальный параметр Express 'views', для поиска файлов шаблонов
app.set('views', path.join(__dirname, 'views'));
// указывает Express, что он должен использовать Handlebars в качестве шаблонизатора
app.set('view engine', 'hbs');

// body-parser используется для анализа данных формы как результат события POST и 
//      присоединения этих данных к объекту запроса. 
import bodyParser from 'body-parser';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cookie-parser и express-session используются для обработки сеанса
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// 
import session from 'express-session';
// ошибка:
//      Property 'username' does not exist on type 'Session & Partial<SessionData>'.
// решение: 
//      Here's how you can implement Declaration merging on express-session:
//      [Declaration merging]
//      (https://www.typescriptlang.org/docs/handbook/declaration-merging.html) 
//      can be used to add your own properties.
declare module 'express-session' {
    export interface SessionData {
        username: { [key: string]: any };
    }
}
app.use(session({ secret: 'secret' }));

// строго типизируем параметры: req как тип express.Request и res как тип express.Response
app.get('/', (req: express.Request, res: express.Response) => {
    res.send(`root --- req.url = ${req.url}`);
});

// функция-обработчик из другого модуля
app.get('/hello', processRequest);

// Express предоставляет обработчик маршрутов. Можно создать множество обработчиков запросов и 
// зарегистрировать их в глобальном экземпляре обработчика маршрутов Express.Router 

// вызывает функцию app.use для регистрации обработчиков маршрутов
app.use('/', Index.router);
app.use('/', Login.router);

// функция listen запускает цикл прослушивания на порту 3000
app.listen(3000, () => {
    console.log('http://localhost:3000/');
    console.log('http://localhost:3000/hello/');
    console.log('http://localhost:3000/index/');
    console.log('http://localhost:3000/login/');
});
