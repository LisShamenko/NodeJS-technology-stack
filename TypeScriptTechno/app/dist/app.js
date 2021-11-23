"use strict";
// --------------- запуск
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const ModuleHandler_1 = require("./Routers/ModuleHandler");
const Index = __importStar(require("./Routers/Index"));
const Login = __importStar(require("./Routers/Login"));
let app = express_1.default();
// устанавливаем настройки для файлов layout
//      https://metanit.com/web/nodejs/4.19.php
//      app.engine("hbs", expressHbs({ layoutsDir: "views/layouts", defaultLayout: "layout", extname: "hbs" }))
// Модуль path позволяет использовать несколько удобных функций при работе с путевыми именами каталогов. 
const path = __importStar(require("path"));
// установить полный путь к каталогу локальных представлений, где __dirname содержит полный путь к текущему каталогу
//      Handlebars будет по умолчанию использовать глобальный параметр Express 'views', для поиска файлов шаблонов
app.set('views', path.join(__dirname, 'views'));
// указывает Express, что он должен использовать Handlebars в качестве шаблонизатора
app.set('view engine', 'hbs');
// body-parser используется для анализа данных формы как результат события POST и 
//      присоединения этих данных к объекту запроса. 
const body_parser_1 = __importDefault(require("body-parser"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// cookie-parser и express-session используются для обработки сеанса
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use(cookie_parser_1.default());
// 
const express_session_1 = __importDefault(require("express-session"));
app.use(express_session_1.default({ secret: 'secret' }));
// строго типизируем параметры: req как тип express.Request и res как тип express.Response
app.get('/', (req, res) => {
    res.send(`root --- req.url = ${req.url}`);
});
// функция-обработчик из другого модуля
app.get('/hello', ModuleHandler_1.processRequest);
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
//# sourceMappingURL=app.js.map