// --------------- refactoring

//      https://www.oreilly.com/library/view/programming-c/0596001177/ch08.html
//      https://d-fens.ch/2016/05/22/c-code-contracts-and-interface-properties/

// --------------- Интерфейсы

namespace interfaces {

    // Интерфейс предоставляет механизм для определения того, какие свойства и методы должен 
    // реализовывать объект, и является способом определения пользовательского типа. Используя 
    // этот синтаксис, можно типизировать переменную как тип интерфейса. У переменной должны 
    // быть те же свойства, что описаны в интерфейсе. Если объект придерживается интерфейса, 
    // говорят, что объект реализует интерфейс. Интерфейсы определяются с помощью ключевого 
    // слова interface.
    interface IComplexType { id: number; name: string; }
    let complexType: IComplexType;
    complexType = { id: 1, name: "test" };

    // Необязательные свойства
    interface IOptionalProp { id: number; name?: string; }

    // Интерфейсы являются свойством языка времени компиляции TypeScript, и компилятор не генерирует 
    // никакого кода JavaScript из интерфейсов, которые вы включаете в свои проекты TypeScript. 
    // Интерфейсы используются компилятором только для проверки типов в ходе шага компиляции.

    // Слабые типы
    // Когда интерфейс содержит только необязательные свойства, он считается слабым типом. 
    // Можем ли мы действительно сказать, что объект реализует интерфейс? 
    interface IWeakType {
        id?: number,
        name?: string
    }
    let weakTypeNoOverlap: IWeakType;
    //      переменная weakTypeNoOverlap должна реализовывать интерфейс IWeakType или некоторую его часть
    //      между свойствами IWeakType и присваиванием переменной нет перекрытия:
    //weakTypeNoOverlap = { description: "my description" };

    // Оператора in - позволяет проверить обладает ли интерфейс указанным свойством
    interface IdNameProperty { id: number; name: string; }
    interface TextValueProperty { text: string; value: number; }
    function printNameOrDescription(value: IdNameProperty | TextValueProperty) {
        // оператор in позволяет нам генерировать охранников типов для интерфейсов
        if ('id' in value) {
            console.log(`IdNameProperty --- name = ${value.name}`);
        }
        if ('value' in value) {
            console.log(`TextValueProperty --- text = ${value.text}`);
        }
    }

}

// --------------- реализация ООП

// Пространства имен
// определение класса не будет видно за пределами пространства имен, если только специально не разрешить 
//      этого с помощью ключевого слова export. 
namespace classes {

    // Класс – это определение объекта: какие данные содержит и какие операции выполняет.
    // Данные хранятся в виде свойств класса. Свойства могут быть приватными или общедоступными. 
    // Код внутри класса получает доступ к данным через ключевое слово this, которое указывает
    // компилятору, что идет обращение к свойствам и функциям экземпляра класса.
    export class SimpleClass implements ISimpleClass {

        // Модификаторы доступа public и private
        private id: number;
        public name: string;

        // Свойство readonly (может быть установлено только в конструкторе)
        readonly title: string;

        // Конструктор
        constructor(_id: number, _name: string, _title: string) {
            this.id = _id;
            this.name = _name;
            this.title = _title;
        }
        // сокращенная версия конструктора (не рекомендуется)
        ///constructor(private id: number, public name: string) { }

        // Методы доступа (getter и setter)
        get Id() {
            console.log(`getter`);
            return <number>this.id;
        }
        set Id(value: number) {
            console.log(`setter`);
            this.id = value;
        }

        // Статические функции и свойства
        static count = 0;
        static printTwo() {
            console.log(`static function`);
        }

        // Функции: 
        //      - строгая типизация
        //      - ключевое слово any, чтобы ослабить сильную типизацию
        //      - необязательные параметры
        //      - параметры по умолчанию
        //      - массивы аргументов / синтаксис оставшихся параметров
        //      - функции обратного вызова
        //      - перегрузки функции
        print(id: number, name: string): string;
        print(id: string, name: string): string;
        print(id: any, name: any): string {
            // охранник типов
            if (typeof id === "number") {
                this.id = id;
            }
            this.name = name;
            return `id = ${this.id} --- name = ${this.name}`;
        }
        usingTheAnyKeyword(arg: any): any {
            this.id = arg;
        }
        usingOptionalParameters(optionalArg?: number) {
            if (optionalArg) {
                this.id = optionalArg;
            }
        }
        usingDefaultParameters(defaultArg: number = 0) {
            this.id = defaultArg;
        }
        usingRestSyntax(...argArray: number[]) {
            if (argArray.length > 0) {
                this.id = argArray[0];
            }
        }
        usingFunctionCallbacks(callback: (id: number) => string) {
            callback(this.id);
        }
    }

    // Интерфейсы
    interface ISimpleClass {
        name: string;
        // интерфейсы не могут включать в себя сигнатуры конструкторов
        print(id: number, name: string): string;
        print(id: string, name: string): string;
        usingTheAnyKeyword(arg1: any): any;
        usingOptionalParameters(optionalArg1?: number): void;
        usingDefaultParameters(defaultArg1?: number): void;
        usingRestSyntax(...argArray: number[]): void;
        usingFunctionCallbacks(callback: (id: number) => string): void;
    }

    let mySimpleClass = new SimpleClass(0, '', '');
    mySimpleClass.print(0, '');
}

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

namespace principles {

    // Полиморфизм
    // Класс – это определение объекта, включая его свойства и функции. Интерфейс – это определение 
    // пользовательского типа, в том числе его свойств и функций. Классы должны реализовывать функции и 
    // свойства, тогда как интерфейсы только описывают их. Интерфейсы описывают общее поведение группы
    // классов, что дает возможность писать код работающий с любым из этих классов.
    interface IPrint {
        print(): void;
    }
    class ClassA implements IPrint {
        print() { console.log('ClassA.print()') };
    }
    class ClassB implements IPrint {
        print() { console.log('ClassB.print()') };
    }
    class ClassC implements IPrint {
        print() { console.log('ClassC.print()') };
    }

    // 
    let classA = new ClassA();
    let classB = new ClassB();
    let classC = new ClassC();

    // применение полиморфизма
    function printClass(a: IPrint) {
        a.print();
    }
    printClass(classA);
    printClass(classB);
    printClass(classC);

    // instanceof - проверяет, был ли объект создан из определенного класса
    function checkInstanceOf(value: ClassA | ClassB | ClassC) {
        if (value instanceof ClassA) console.log(`found instanceof BfromA`);
        if (value instanceof ClassB) console.log(`found instanceof CFromA`);
        if (value instanceof ClassC) console.log(`found instanceof DfromC`);
    }
    checkInstanceOf(classA);
    checkInstanceOf(classB);
    checkInstanceOf(classC);

    // Наследование
    // Наследование означает, что объект использует другой объект в качестве своего базового типа, 
    //      тем самым наследуя все характеристики базового объекта, включая все свойства и функции.
    // - TypeScript не поддерживает концепцию множественного наследования классов
    // - класс может реализовывать множество интерфейсов

    // базовый интерфейс
    interface IBase {
        id: number | undefined;
    }

    // наследование интерфейса
    interface IDerived extends IBase {
        name: string | undefined;
    }

    // реализация интерфейса
    class BaseClass implements IBase { // IDerived { // 
        id: number | undefined;
        //name: string | undefined;
        // модификатор доступа protected, title доступен только в производных классах
        protected title: string;
        // конструктор
        constructor(_id: number) {
            this.id = _id;
            this.title = '';
            //this.name = '';
        }
        // функция
        getProperties(): string {
            return `id: ${this.id}`;
        }
    }

    // наследование класса
    class DerivedClass extends BaseClass implements IDerived {
        name: string | undefined;
        // Переопределение конструктора
        constructor(_id: number, _name: string) {
            // вызывает функцию в базовом классе, имя которой совпадает с именем функции в производном классе
            super(_id);
            this.name = _name;
        }
        // Переопределение функции
        getProperties(): string {
            return `${super.getProperties()}` + ` , name: ${this.name}`;
        }
    }

    // Абстрактный класс - средство повторного использования кода
    // - не предполагает создания экземпляров и предназначен только для наследования
    // - может содержать как реализации методов, так и объявления без кода
    abstract class AbstractClass {
        public id: number;
        public name: string;
        abstract getProperties(): string;
        public printProperties() {
            console.log(this.getProperties());
        }
        constructor() {
            this.id = 0;
            this.name = '';
        }
    }
    class NewAbstractClass extends AbstractClass {
        getProperties(): string {
            return `id = ${this.id} --- name = ${this.name}`;
        }
        constructor() {
            super();
        }
    }
    let newClass: NewAbstractClass = new NewAbstractClass();
    newClass.printProperties();
    newClass.getProperties();

}

