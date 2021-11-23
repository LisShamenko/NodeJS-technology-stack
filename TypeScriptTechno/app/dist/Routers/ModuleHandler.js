"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRequest = void 0;
// функция processRequest является функцией-обработчиком запроса
function processRequest(req, res) {
    console.log('SimpleModuleHandler.processRequest');
    res.send('Hello World');
}
exports.processRequest = processRequest;
;
//# sourceMappingURL=ModuleHandler.js.map