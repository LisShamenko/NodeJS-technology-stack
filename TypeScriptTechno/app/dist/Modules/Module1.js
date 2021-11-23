"use strict";
// --------------- Экспорт модулей
Object.defineProperty(exports, "__esModule", { value: true });
exports.myVariable = exports.NewModule1 = exports.Module1 = void 0;
// ключевое слово export делает Module1 доступным в других файлах
class Module1 {
    print() {
        print(`Module1.print()`);
    }
}
exports.Module1 = Module1;
exports.NewModule1 = Module1;
function print(functionName) {
    console.log(`print() called with ${functionName}`);
}
// экспорт переменных
let myVariable = "This is a variable.";
exports.myVariable = myVariable;
//# sourceMappingURL=Module1.js.map