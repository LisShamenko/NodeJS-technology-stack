// --------------- refactoring

//      https://www.typescriptlang.org/docs/handbook/decorators.html

// --------------- 

// Декораторы позволяют внедрять и запрашивать метаданные при работе с определениями классов, а также дают возможность программным путем подключаться к определению класса. 
// Обобщения предоставляют способ написания процедур, когда точный тип используемого объекта неизвестен до времени выполнения. 
// Промисы предоставляют возможность свободно писать асинхронный код, а функции async await приостанавливают выполнение до завершения асинхронной функции.

// --------------- Декораторы

import 'reflect-metadata';

namespace decorators {

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
    function simpleDecorator(constructor: Function) {
        console.log('simpleDecorator called.');
    }
    function secondDecorator(constructor: Function) {
        console.log('secondDecorator called.')
    }

    // Декоратор класса - будет вызываться с помощью функции-конструктора декорированного класса
    function decoratorConstructor(constructor: Function) {

        // необходимо выполнить (<any>constructor), так как свойство функции name доступно только из ECMAScript 6
        console.log(`
        --- constructor = ${constructor} 
        --- имя конструктора = ${(<any>constructor).name}`);

        // изменение определения класса, добавлено новое свойство:
        constructor.prototype.testProperty = "добавлено новое свойство";
    }

    // Декораторы свойств – вызывается с двумя параметрами – самим прототипом класса и именем свойства
    function decoratorProperty(target: any, propertyKey: string) {

        // для статического свойства меняются значения для target, target.constructor и target.constructor.name
        //      когда декорируется статическое свойство, то целевым аргументом (target) будет сам конструктор класса
        //      когда декорируется свойство экземпляра, то целевым аргументом (target) будет прототип класса

        let className: string;
        if (typeof (target) === 'function') {
            className = `class name : ${target.name}`;
        } else {
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
    function decoratorMethod(target: any, methodName: string, descriptor?: PropertyDescriptor) {

        console.log(`
        --- target              : ${target}
        --- имя метода          : ${methodName}
        --- определение метода  : ${target[methodName]}`);

        // --- мощный метод незаметного внедрения дополнительной функциональности в объявление класса

        // сохранили исходную функцию
        let originalFunction = target[methodName];

        // заменили исходную функцию
        target[methodName] = function (this: any) {
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
    function decoratorParameter(target: any, methodName: string, parameterIndex: number) {
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
    function decoratorFactory(name: string) {
        return function (constructor: Function) {
            console.log(`функции-декоратора был передан параметр: name = ${name}`);
        }
    }

    // - декораторы применяются, когда класс определяется, а не когда создается его экземпляр
    // - декораторы вызываются в обратном порядке их определения
    @simpleDecorator
    @secondDecorator
    @decoratorFactory('test')
    @decoratorConstructor
    class ClassDecorators {
        // декоратор свойства экземпляра
        @decoratorProperty
        name: string;
        // декоратор статического свойства
        @decoratorProperty
        static title: string = 'static title';
        // декоратор метода
        @decoratorMethod
        print(arg1: string, arg2: string, @decoratorParameter arg3: string) {
            console.log(`метод print с декоратором и заменой --- (${arg1}, ${arg2}) called.`);
        }
        constructor(){
            this.name = 'this name';
        }
    }
    // 
    let classDecorators = new ClassDecorators();
    console.log(`classDecorators:`);
    // свойство testProperty не определено в классе, поэтому требуется приведение к типу any
    console.log(`--- testProperty = ${(<any>classDecorators).testProperty}`);
    classDecorators.print("test1", "test2", "test3");
}