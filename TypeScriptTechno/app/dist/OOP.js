"use strict";
// --------------- refactoring
//      https://www.oreilly.com/library/view/programming-c/0596001177/ch08.html
//      https://d-fens.ch/2016/05/22/c-code-contracts-and-interface-properties/
// --------------- Интерфейсы
var interfaces;
(function (interfaces) {
    let complexType;
    complexType = { id: 1, name: "test" };
    let weakTypeNoOverlap;
    function printNameOrDescription(value) {
        // оператор in позволяет нам генерировать охранников типов для интерфейсов
        if ('id' in value) {
            console.log(`IdNameProperty --- name = ${value.name}`);
        }
        if ('value' in value) {
            console.log(`TextValueProperty --- text = ${value.text}`);
        }
    }
})(interfaces || (interfaces = {}));
// --------------- реализация ООП
// Пространства имен
// определение класса не будет видно за пределами пространства имен, если только специально не разрешить 
//      этого с помощью ключевого слова export. 
var classes;
(function (classes) {
    // Класс – это определение объекта: какие данные содержит и какие операции выполняет.
    // Данные хранятся в виде свойств класса. Свойства могут быть приватными или общедоступными. 
    // Код внутри класса получает доступ к данным через ключевое слово this, которое указывает
    // компилятору, что идет обращение к свойствам и функциям экземпляра класса.
    class SimpleClass {
        // Конструктор
        constructor(_id, _name, _title) {
            this.id = _id;
            this.name = _name;
            this.title = _title;
        }
        // сокращенная версия конструктора (не рекомендуется)
        ///constructor(private id: number, public name: string) { }
        // Методы доступа (getter и setter)
        get Id() {
            console.log(`getter`);
            return this.id;
        }
        set Id(value) {
            console.log(`setter`);
            this.id = value;
        }
        static printTwo() {
            console.log(`static function`);
        }
        print(id, name) {
            // охранник типов
            if (typeof id === "number") {
                this.id = id;
            }
            this.name = name;
            return `id = ${this.id} --- name = ${this.name}`;
        }
        usingTheAnyKeyword(arg) {
            this.id = arg;
        }
        usingOptionalParameters(optionalArg) {
            if (optionalArg) {
                this.id = optionalArg;
            }
        }
        usingDefaultParameters(defaultArg = 0) {
            this.id = defaultArg;
        }
        usingRestSyntax(...argArray) {
            if (argArray.length > 0) {
                this.id = argArray[0];
            }
        }
        usingFunctionCallbacks(callback) {
            callback(this.id);
        }
    }
    // Статические функции и свойства
    SimpleClass.count = 0;
    classes.SimpleClass = SimpleClass;
    let mySimpleClass = new SimpleClass(0, '', '');
    mySimpleClass.print(0, '');
})(classes || (classes = {}));
// --------------- рассуждения по терминологии
// - Класс является сущностью (объектом), который инкапсулирует данные и операции над этими данными, т.е.
// класс может выполнять некоторый набор действий над данными или обладает поведением.
// - Интерфейс объявляет это поведение, т.е. содержит описание того что должен делать класс и над какими 
// данными, но не говорит о том как класс должен это делать. Можно сказать интерфейс определяет 
// функционал или поведение класса.
// - Контракт содержит набор требований и ограничений, само понятие контракта не подразумевает 
// наличие данных или каких то действий над данными, это просто рамки в которых должен существовать 
// класс, такое понимание полностью противоречит определению класса.
// --------------- принципы ООП
var principles;
(function (principles) {
    class ClassA {
        print() { console.log('ClassA.print()'); }
        ;
    }
    class ClassB {
        print() { console.log('ClassB.print()'); }
        ;
    }
    class ClassC {
        print() { console.log('ClassC.print()'); }
        ;
    }
    // 
    let classA = new ClassA();
    let classB = new ClassB();
    let classC = new ClassC();
    // применение полиморфизма
    function printClass(a) {
        a.print();
    }
    printClass(classA);
    printClass(classB);
    printClass(classC);
    // instanceof - проверяет, был ли объект создан из определенного класса
    function checkInstanceOf(value) {
        if (value instanceof ClassA)
            console.log(`found instanceof BfromA`);
        if (value instanceof ClassB)
            console.log(`found instanceof CFromA`);
        if (value instanceof ClassC)
            console.log(`found instanceof DfromC`);
    }
    checkInstanceOf(classA);
    checkInstanceOf(classB);
    checkInstanceOf(classC);
    // реализация интерфейса
    class BaseClass {
        // конструктор
        constructor(_id) {
            this.id = _id;
            this.title = '';
            //this.name = '';
        }
        // функция
        getProperties() {
            return `id: ${this.id}`;
        }
    }
    // наследование класса
    class DerivedClass extends BaseClass {
        // Переопределение конструктора
        constructor(_id, _name) {
            // вызывает функцию в базовом классе, имя которой совпадает с именем функции в производном классе
            super(_id);
            this.name = _name;
        }
        // Переопределение функции
        getProperties() {
            return `${super.getProperties()}` + ` , name: ${this.name}`;
        }
    }
    // Абстрактный класс - средство повторного использования кода
    // - не предполагает создания экземпляров и предназначен только для наследования
    // - может содержать как реализации методов, так и объявления без кода
    class AbstractClass {
        constructor() {
            this.id = 0;
            this.name = '';
        }
        printProperties() {
            console.log(this.getProperties());
        }
    }
    class NewAbstractClass extends AbstractClass {
        getProperties() {
            return `id = ${this.id} --- name = ${this.name}`;
        }
        constructor() {
            super();
        }
    }
    let newClass = new NewAbstractClass();
    newClass.printProperties();
    newClass.getProperties();
})(principles || (principles = {}));
//# sourceMappingURL=OOP.js.map