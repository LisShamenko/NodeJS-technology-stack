"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module2NonDefault = void 0;
// экспорт по умолчанию
class Module2Default {
    print() {
        console.log(`Module2Default.print()`);
    }
}
exports.default = Module2Default;
// может быть только один экспорт по умолчанию для каждого модуля
// но можно экспортировать другие элементы через стандартный синтаксис экспорта
class Module2NonDefault {
    print() {
        console.log(`Module2NonDefault.print()`);
    }
}
exports.Module2NonDefault = Module2NonDefault;
// компиляция класса 'Module2NonDefault' в CommonJS генерирует приблизительно следующий код:
//      "use strict";
//      var Module3 = /** @class */ (function () {
//          function Module3() { }
//          Module3.prototype.print = function () {
//              console.log("Module3.print()");
//          };
//          return Module3;
//      }());
//      exports.Module3 = Module3;
// компиляция класса 'Module2NonDefault' в AMD генерирует приблизительно следующий код:
//      define(["require", "exports"], function (require, exports) {
//          "use strict";
//          var Module3 = /** @class */ (function () {
//              function Module3() { }
//              Module3.prototype.print = function () {
//                  console.log("Module3.print()");
//              };
//              return Module3;
//          }());
//          exports.Module3 = Module3;
//      });
// define принимает два параметра:
// - массив строк, который является массивом зависимостей, которые необходимо загрузить для этого модуля
// - функция, вызывается после загрузки зависимых библиотек
//# sourceMappingURL=Module2.js.map