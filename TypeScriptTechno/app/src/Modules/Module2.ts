// экспорт по умолчанию
export default class Module2Default {
    print() {
        console.log(`Module2Default.print()`);
    }
}

// может быть только один экспорт по умолчанию для каждого модуля
// но можно экспортировать другие элементы через стандартный синтаксис экспорта
export class Module2NonDefault {
    print() {
        console.log(`Module2NonDefault.print()`);
    }
}

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
