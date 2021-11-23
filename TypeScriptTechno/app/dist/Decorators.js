"use strict";
// --------------- refactoring
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
//      https://www.typescriptlang.org/docs/handbook/decorators.html
// --------------- 
// Декораторы позволяют внедрять и запрашивать метаданные при работе с определениями классов, а также дают возможность программным путем подключаться к определению класса. 
// Обобщения предоставляют способ написания процедур, когда точный тип используемого объекта неизвестен до времени выполнения. 
// Промисы предоставляют возможность свободно писать асинхронный код, а функции async await приостанавливают выполнение до завершения асинхронной функции.
// --------------- Декораторы
require("reflect-metadata");
var decorators;
(function (decorators) {
    // чтобы использовать декораторы следует добавить опцию 'experimentalDecorators:true' в файл tsconfig.json:
    //      {
    //          "compilerOptions": {
    //              "target": "es5",
    //              "module": "commonjs",
    //              "lib": [
    //                  "es2015",
    //                  "dom",
    //              ],
    //              "strict": true,
    //              "esModuleInterop": true,
    //              "experimentalDecorators": true,
    //              "emitDecoratorMetadata": true,
    //          }
    //      }
    // Декоратор – это просто функция, которая вызывается с определенным набором параметров. Эти параметры автоматически 
    // заполняются средой выполнения JavaScript и содержат информацию о классе, к которому был применен декоратор.
    // Количество параметров и типы этих параметров определяют, где можно применять декоратор.
    function simpleDecorator(constructor) {
        console.log('simpleDecorator called.');
    }
    function secondDecorator(constructor) {
        console.log('secondDecorator called.');
    }
    // Декоратор класса - будет вызываться с помощью функции-конструктора декорированного класса
    function decoratorConstructor(constructor) {
        // необходимо выполнить (<any>constructor), так как свойство функции name доступно только из ECMAScript 6
        console.log(`
        --- constructor = ${constructor} 
        --- имя конструктора = ${constructor.name}`);
        // изменение определения класса, добавлено новое свойство:
        constructor.prototype.testProperty = "добавлено новое свойство";
    }
    // Декораторы свойств – вызывается с двумя параметрами – самим прототипом класса и именем свойства
    function decoratorProperty(target, propertyKey) {
        // для статического свойства меняются значения для target, target.constructor и target.constructor.name
        //      когда декорируется статическое свойство, то целевым аргументом (target) будет сам конструктор класса
        //      когда декорируется свойство экземпляра, то целевым аргументом (target) будет прототип класса
        let className;
        if (typeof (target) === 'function') {
            className = `class name : ${target.name}`;
        }
        else {
            className = `class name : ${target.constructor.name}`;
        }
        console.log(`
        --- имя класса              : ${className}
        --- target                  : ${target}
        --- функция-конструктор     : ${target.constructor} 
        --- имя конструктора        : ${target.constructor.name} 
        --- имя свойства            : ${propertyKey}`);
    }
    // Декораторы методов – вызываются с тремя параметрами: прототип класса, имя метода и (необязательно) дескриптор метода
    function decoratorMethod(target, methodName, descriptor) {
        console.log(`
        --- target              : ${target}
        --- имя метода          : ${methodName}
        --- определение метода  : ${target[methodName]}`);
        // --- мощный метод незаметного внедрения дополнительной функциональности в объявление класса
        // сохранили исходную функцию
        let originalFunction = target[methodName];
        // заменили исходную функцию
        target[methodName] = function () {
            console.log(`--- overide of ${methodName} called`);
            for (let i = 0; i < arguments.length; i++) {
                console.log(`--- --- arg : ${i} = ${arguments[i]}`);
            }
            // вызвали оригинальную функцию через метод apply
            originalFunction.apply(this, arguments);
        };
        return target;
    }
    // Метаданные декораторов – дополнительная информация, которая генерируется в определениях классов и передается в декораторы
    // 
    // чтобы включить метаданные следует добавить опцию 'emitDecoratorMetadata:true' в файл tsconfig.json
    //      {
    //          "compilerOptions": {
    //              "experimentalDecorators": true,
    //              "emitDecoratorMetadata": true
    //          }
    //      }
    // 
    // метаданные (emitDecoratorMetadata:false)
    //      __decorate([__param(0, metadataParameterDec)], ClassWithMetaData.prototype, "print");
    // метаданные (emitDecoratorMetadata:true)
    //      __decorate([__param(0, metadataParameterDec), 
    //              __metadata('design:type', Function),                // функция print имеет тип Function
    //              __metadata('design:paramtypes', [Number, String]),  // у функции print есть два параметра: Number и String
    //              __metadata('design:returntype', Number)             // для регистрации возвращаемого типа функции print
    //          ], ClassWithMetaData.prototype, "print");
    // 
    // использовать метаданные можно через пакет reflect-metadata
    // установить пакет
    //      npm install reflect-metadata --save-dev
    // установить файл объявлений
    //      npm install @types/reflect-metadata --save-dev
    // Декораторы параметров используются для декорирования параметров конкретного метода
    function decoratorParameter(target, methodName, parameterIndex) {
        // в декоратор не передается какая либо информация о самом параметре, поэтому декоратор может 
        //      использоваться только для того, чтобы установить, что параметр был объявлен в методе
        console.log(`
        --- прототип класса     : ${target}
        --- имя метода          : ${methodName}
        --- индекс параметра    : ${parameterIndex}`);
        // опрос метаданных через пакет 'reflect-metadata'
        let designType = Reflect.getMetadata("design:type", target, methodName);
        let designParamTypes = Reflect.getMetadata("design:paramtypes", target, methodName);
        let designReturnType = Reflect.getMetadata("design:returntype", target, methodName);
        console.log(`
        --- designType          : ${designType}
        --- paramtypes          : ${designParamTypes}
        --- returntypes         : ${designReturnType}`);
    }
    // Фабрика декораторов – это функция-обертка, которая возвращает функцию-декоратор и позволяет передавать в нее параметры.
    //      1. функция-декоратор будет по-прежнему вызываться средой выполнения JavaScript с автоматически заполненными параметрами
    //      2. фабрика декораторов должна возвращать определение функции
    function decoratorFactory(name) {
        return function (constructor) {
            console.log(`функции-декоратора был передан параметр: name = ${name}`);
        };
    }
    // - декораторы применяются, когда класс определяется, а не когда создается его экземпляр
    // - декораторы вызываются в обратном порядке их определения
    let ClassDecorators = class ClassDecorators {
        constructor() {
            this.name = 'this name';
        }
        // декоратор метода
        print(arg1, arg2, arg3) {
            console.log(`метод print с декоратором и заменой --- (${arg1}, ${arg2}) called.`);
        }
    };
    // декоратор статического свойства
    ClassDecorators.title = 'static title';
    __decorate([
        decoratorProperty,
        __metadata("design:type", String)
    ], ClassDecorators.prototype, "name", void 0);
    __decorate([
        decoratorMethod,
        __param(2, decoratorParameter),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, String]),
        __metadata("design:returntype", void 0)
    ], ClassDecorators.prototype, "print", null);
    __decorate([
        decoratorProperty,
        __metadata("design:type", String)
    ], ClassDecorators, "title", void 0);
    ClassDecorators = __decorate([
        simpleDecorator,
        secondDecorator,
        decoratorFactory('test'),
        decoratorConstructor,
        __metadata("design:paramtypes", [])
    ], ClassDecorators);
    // 
    let classDecorators = new ClassDecorators();
    console.log(`classDecorators:`);
    // свойство testProperty не определено в классе, поэтому требуется приведение к типу any
    console.log(`--- testProperty = ${classDecorators.testProperty}`);
    classDecorators.print("test1", "test2", "test3");
})(decorators || (decorators = {}));
//# sourceMappingURL=Decorators.js.map