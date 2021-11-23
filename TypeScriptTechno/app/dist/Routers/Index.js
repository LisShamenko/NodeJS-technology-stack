"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
// Функция Router возвращает один и тот же экземпляр маршрутизатора независимо от того, откуда он был вызван
let router = express_1.default.Router();
exports.router = router;
router.get('/index', (req, res) => {
    // render принимает имя шаблона и простой Java-объект POJO в качестве входных данных для шаблонизатора
    res.render('index', {
        title: 'Express',
        username: req.session['username']
    });
});
//# sourceMappingURL=Index.js.map