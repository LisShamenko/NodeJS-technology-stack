// TypeScript использует сильную типизацию в JavaScript, т.е. тип переменной не может быть 
// изменен после ее поределения. Сильная типизация реализуется за счет синтаксиса
// называемого 'аннотацией типа' (Андерс Хейлсберг называет это 'синтаксическим сахаром') и
// используется везде, где применяется переменная.
// JavaScript является динамически типизированным языком, т.е. тип переменной определяется
// операцией присваивания интерпретатором JavaScript.

// --------------- Синтаксис типов

namespace data_types {

    // типы в классе
    class DataTypesClass {

        // анотация типов: string, number и boolean
        myString: string;
        myNumber: number;
        myBoolean: boolean;

        // анотация типов: массивы и перечисления
        arrayOfNumbers: number[];

        // анотация типов: any
        item1: any = { id: 1, name: "item 1" };

        // конструктор
        constructor() {
            this.myString = "";
            this.myNumber = 0;
            this.myBoolean = true;
            this.arrayOfNumbers = [1, 2, 3];

            // any ослабляет проверку сильной типизации компилятором, т.е. без any этот код вызовет ошибку
            this.item1 = { id: 2 };
            // any используется для обратной совместимости с JavaScript, и в TypeScript следует его избегать
            // Simply Find an Interface for the Any Type(S.F.I.A.T) - тип any всегда следует заменять 
            //      интерфейсом, поэтому просто найдите его. Интерфейс – это способ определения 
            //      пользовательских типов в TypeScript.
        }

        // анотация типов: параменты метода / возвращаемое значение
        doCalculation(a: number, b: number, c: number): number {
            return (a * b) + c;
        }

        // Анонимные функции
        anonymousFunctions(): void {

            console.log(`data_types --- анонимные функции`);

            // анонимные функции определяются на лету без имени
            let addFunction = function (a: number, b: number): number {
                return a + b;
            }

            // Необязательные параметры - позволяют вызывать функции с отсутствующими параметрами
            let concatStrings = function (a: string, b: string, c?: string): string {
                return a + b + c;
            }
            console.log(`concatstrings("a", "b", "c") : ${concatStrings("a", "b", "c")}`);
            console.log(`concatstrings("a", "b") : ${concatStrings("a", "b")}`);

            // Параметры по умолчанию
            let concatStringsDefault = function (a: string, b: string, c: string = "c"): string {
                return a + b + c;
            }
            console.log(`defaultConcat("a", "b") : ${concatStringsDefault("a", "b")}`);

            // Оставшиеся параметры (эквивалент arguments)
            // Каждая функция JavaScript имеет доступ к специальной переменной с именем arguments,
            //      которая содержит массив всех переданных в функцию аргументов,
            let testArguments = function (...argArray: number[]) {
                // TypeScript будет рассматривать любой элемент массива argArray как число, однако
                // массив arguments будет рассматриваться как тип any, так как у него нет выводимого типа
                if (argArray.length > 0) {
                    for (var i = 0; i < argArray.length; i++) {
                        // arguments все еще доступна для использования в TypeScript
                        console.log(`arguments[${i}] = ${arguments[i]}`);   // JavaScript
                        console.log(`argArray[${i}] = ${argArray[i]}`);     // TypeScript
                    }
                }
            }

            // Функция обратного вызова
            // программисты на JavaScript должны: 
            //      1. кодировать недопустимое использование функций обратного вызова (typeof callback === "function")
            //      2. документировать сигнатуры, как обратных функций, так и использующих их функций
            let callbackFunction = function (text: string, callback: (text: string) => void) {
                // void – это ключевое слово, которое обозначает, что функция не возвращает значение
                console.log(`inside --- ${text}`);
                callback(text);
            }
            callbackFunction('message', (text) => console.log(`callback --- ${text}`));

            // Переопределение функций - возможность вызова одной и той же функции с разными типами
            //      - ни одна из сигнатур функций кроме последней фактически не имеет тела функции
            function add(a: string, b: string): string;
            function add(a: number, b: number): number;
            //      - последнее определение использует спецификатор типа any и включает тело функции
            //      - по существу, данная сигнатура скрыта, а на самом деле используются две предыдущие
            function add(a: any, b: any): any {
                return a + b;
            }
            console.log(`--- add(1, 1) = ${add(1, 1)} --- add("1", "1") = ${add("1", "1")}`);

            // try...catch...finally работает точно так же
            try {
                console.log(`try`);
                throw Error();
            } catch (error) {
                console.log(`catch: ${error}`);
            } finally {
                console.log(`finally`);
            }
        }

        // перебор массива
        array() {
            // E5
            for (var i = 0; i < this.arrayOfNumbers.length; i++) {
                console.log(`arrayOfNumbers[${i}] = ${this.arrayOfNumbers[i]}`);
            }
            // E6 - перебор ключей
            for (var itemKey in this.arrayOfNumbers) {
                var itemValue = this.arrayOfNumbers[itemKey];
                console.log(`arrayOfNumbers[${itemKey}] = ${itemValue}`);
            }
            // E6 - перебор значений
            for (var arrayItem of this.arrayOfNumbers) {
                console.log(`arrayItem = ${arrayItem}`);
            }
        }
    }

    // 
    let dataTypesClass = new DataTypesClass();
    console.log(`data_types --- DataTypesClass.doCalculation(3, 2, 1): ${dataTypesClass.doCalculation(3, 2, 1)}`);
    console.log(`data_types --- DataTypesClass.anonymousFunctions(): ${dataTypesClass.anonymousFunctions()}`);

    // типизация с поддержкой вывода типов
    let inferredString = "this is a string";

    // утиная типизация
    //      "если что-то выглядит как утка и ходит как утка, то это, вероятно, и есть утка"
    //      "типы двух переменных считаются равными, если они имеют одинаковые свойства и методы"
    //      "если объекты обладают одинаковым набором атрибутов, то они относятся к одному типу"
    let complexType1 = { name: "myName", id: 1 };    // вывод типа
    complexType1 = { id: 2, name: "anotherName" };   // утиная типизация

    // явное приведение типов
    var complexType2 = <any>{ id: 1, name: "item 1" };     // объект в правой части присваивания рассматривается как тип any
    complexType2 = { id: 2 };

    // Перечисления – это специальный тип, enum связывает удобочитаемое имя и специальное число,
    //      в сгенерированном коде каждому значению перечисления назначается число
    enum DoorState { Open, Closed, Ajar = 10 };
    console.log(`data_types --- перечисления`);
    console.log(`data_types --- openDoor is: ${DoorState.Open}`);              // 0
    console.log(`data_types --- closedDoor is : ${DoorState["Closed"]}`);      // 1
    console.log(`data_types --- ajarDoor is : ${DoorState[2]}`);               // Ajar

    // генерируемый JavaScript код для перечислений (DoorState заменил на  DoorState):
    // использует шаблоны замыканий и немедленно вызываемых функций 
    //      let DoorState;
    //      (function (DoorState) {
    //          DoorState[DoorState["Open"] = 0] = "Open";
    //          DoorState[DoorState["Closed"] = 1] = "Closed";
    //          DoorState[DoorState["Ajar"] = 2] = "Ajar";
    //      })(DoorState || (DoorState = {}));
    //      console.log(`DoorState --- [0] = ${DoorState[0]} --- ["Open"] = ${DoorState["Open"]}`);
    //      console.log(`DoorState --- [1] = ${DoorState[1]} --- ["Closed"] = ${DoorState["Closed"]}`);
    //      console.log(`DoorState --- [2] = ${DoorState[2]} --- ["Ajar"] = ${DoorState["Ajar"]}`);

    // const enum - облегченный вариант enum, который добавляет ключевое слово const перед 
    //      определением enum, был введен в основном по соображениям производительности
    // Строковые перечисления - каждому значению перечисления назначается строки
    const enum DoorStateConst { Open = "open", Closed = "closed", Ajar = "ajar" };
    console.log(`constDoorOpen is : ${DoorStateConst.Open}`);

    // const и let работают как и в JavaScript:
    // const - значение переменной не может быть изменено после ее определения
    // let - задает область видимости переменной на уровне блока, и переменная 
    //      не может использоваться до ее определения 

    // утверждение присваивания - говорит компилятору, что мы утверждаем, что переменная была 
    //      назначена и что она не должна вызывать ошибку, если она использовалась до назначения,
    //      синтаксис утверждения присваивания заключается в добавлении '!'
    let globalString!: string;                          // при объявлении переменной
    setGlobalString();
    console.log(`globalString : ${globalString!}`);     // при использовании переменной
    function setGlobalString() {
        globalString = "this has been set";
    }

    // Типы свойств с точечной нотацией
    // stringObject.testProperty и stringObject["testProperty"] для TypeScript одно и тоже

    // Числовые разделители ECMAScript - подчеркивание '_' при определении больших чисел
    console.log(`oneMillion = ${1_000_000}`);

}

// --------------- Расширенные типы

namespace extended_types {

    // Объединенные типы - позволяет выражать тип как комбинацию двух или более типов,
    //      путем перечисления всех типов через символ '|'
    let unionType: string | number;
    unionType = 1;
    console.log(`unionType : ${unionType}`);
    unionType = "test";
    console.log(`unionType : ${unionType}`);

    // Охранник типов – это выражение, которое выполняет проверку типа, а затем гарантирует этот тип 
    //      в своей области видимости.
    function addTypeGuard(arg1: string | number, arg2: string | number): string | number {
        // arg1 строка
        if (typeof arg1 === "string") {
            return arg1 + arg2;
        }
        // оба аргумента числа
        if (typeof arg1 === "number" && typeof arg2 === "number") {
            return arg1 + arg2;
        }
        // оба аргумента числа
        return arg1.toString() + arg2.toString();
    }
    console.log(`addTypeGuard(1, 2) = ${addTypeGuard(1, 2)}`);
    console.log(`addTypeGuard("1", "2") = ${addTypeGuard("1", "2")}`);
    console.log(`addTypeGuard(1, "2") = ${addTypeGuard(1, "2")}`);

    // Псевдонимы типов – это соглашение по именованию объединенных типов. Псевдонимы типов могут 
    //      использоваться везде, где используются обычные типы. 
    type StringOrNumber = string | number;
    type StringCallback = (arg1: string) => void;
    function addWithAlias(arg1: StringOrNumber, arg2: StringOrNumber, callback: StringCallback) {
        callback("this is a string");
        return arg1.toString() + arg2.toString();
    }

    // Null и undefined
    // В JavaScript:
    //      undefined - либо переменная не объявлена, либо ей не присвоено значение
    //      null - переменная объявлена, известен тип переменной, но не имеет значения
    function testNullUndefined(testNull: null | number, testUndefined?: number) {
        console.log(`test null: ${testNull} --- test undefined: ${testUndefined}`);
    }
    testNullUndefined(1);
    testNullUndefined(1, 2);
    testNullUndefined(null, undefined);

    // Нулевые операнды
    // TypeScript проверяет наличие null и undefined c базовыми операндами
    // следующий код вызовет ошибку при компиляции:
    //      function testNullOperands(arg1: number, arg2: number | null | undefined) {
    //          let a = arg1 + arg2;    // error TS2533: Object is possibly 'null' or 'undefined'
    //          let b = arg1 * arg2;    // error TS2533: Object is possibly 'null' or 'undefined'
    //          let c = arg1 < arg2;    // error TS2533: Object is possibly 'null' or 'undefined'
    //      }

    // Never - тип для указания случаев, когда что-либо никогда не должно происходить
    function alwaysThrows(): never {
        // функция всегда выдает ошибку и никогда не возвращает значения
        // чтобы обезопасить код используется тип never в определении функции
        throw "this will always throw";
        // return -1; 
    }
    // более практичным использованием never является устранение недостатков в логике кода
    enum TestNeverEnum { FIRST, SECOND };
    function getEnumValue(value: TestNeverEnum): string {
        switch (value) {
            case TestNeverEnum.FIRST: return "First case";
            case TestNeverEnum.SECOND: return "Second case";
        }
        // ошибка логики
        // если в перечисление TestNeverEnum будет добавлено новое значение, то
        // эта строка будет выдавать ошибку (тип TestNeverEnum не равен never)
        let returnValue: never = value;
    }

    // Unknown
    //      тип unknown рассматривается как безопасная версия типа any, так как 
    //      требует приведения из неизвестного типа к известному
    // переменная типа unknown ведет себя как переменная типа any
    let unknownType: unknown = "an unknown string";
    console.log(`unknownType : ${unknownType}`);
    unknownType = 1;
    console.log(`unknownType : ${unknownType}`);
    // чтобы присвоить unknownType переменной типа number, нужно выполнить приведение типа
    let numberType: number = <number>unknownType;

    // Object rest and spread

    // синтаксис оператора остатка (rest) из ES7: копирование всех свойств из одного объекта в другой
    let firstObj = { id: 1, name: "firstObj" };
    let secondObj = { ...firstObj };
    console.log(`secondObj : ${JSON.stringify(secondObj)}`);

    // операция объединения двух объектов, называемая распространением объекта (object spread),
    // свойства копируются постепенно, т.е. свойства объекта, указанного последним, будут иметь приоритет
    let nameObj = { id: 1, name: "nameObj" };
    let titleObj = { id: 2, title: "titleObj" };
    secondObj = { ...nameObj, ...titleObj };
    console.log(`secondObj : ${JSON.stringify(secondObj)}`);

    // операция распространения с массивом чисел
    let firstArray = [1, 2, 3, 4, 5];
    let secondArray = [...firstArray, 6, 7, 8];
    console.log(`firstArray = ${firstArray} --- secondArray = ${secondArray}`);

    // операция распространения с массивом объектов
    let thirdArray = [{ id: 1, name: "name1" }, { id: 2, name: "name2" }];
    thirdArray = [{ id: -1, name: "name-1" }, ...thirdArray, { id: 3, name: "name3" }];
}

// --------------- Обобщения

namespace generic {

    // Обобщения – это способ написания кода, который будет иметь дело с любым типом объекта, но при этом сохранит целостность данного типа. 
    // Термин обобщение, по существу, означает параметризированный тип. Особая роль параметризированных типов состоит в том, что они позволяют создавать классы, структуры, интерфейсы, методы и делегаты, в которых обрабатываемые данные указываются в виде параметра.
    // https://professorweb.ru/my/csharp/charp_theory/level11/11_1.php#:~:text=%D0%A2%D0%B5%D1%80%D0%BC%D0%B8%D0%BD%20%D0%BE%D0%B1%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5%2C%20%D0%BF%D0%BE%20%D1%81%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D1%83%2C%20%D0%BE%D0%B7%D0%BD%D0%B0%D1%87%D0%B0%D0%B5%D1%82,%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5%20%D1%83%D0%BA%D0%B0%D0%B7%D1%8B%D0%B2%D0%B0%D1%8E%D1%82%D1%81%D1%8F%20%D0%B2%20%D0%B2%D0%B8%D0%B4%D0%B5%20%D0%BF%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D0%B0.

    // в качестве T можно использовать любой тип, Т называется обощенным типом
    class StringBuilder<T extends Object> {
        buildFromArray(arrayT: Array<T>): string {
            if (arrayT.length === 0) return '';

            // можно применять только те методы обобщенного массива, которые являются общими для всех массивов
            let returnString = arrayT[0].toString();
            for (let i = 1; i < arrayT.length; i++) {
                returnString += `, ${arrayT[i].toString()}`;
            }
            return returnString;
        }
    }

    // Т - строка
    var fromStringBuilder = new StringBuilder<string>();
    var stringArray: string[] = ["first", "second", "third"];
    var stringResult = fromStringBuilder.buildFromArray(stringArray);

    // Т - число
    var fromNumberBuilder = new StringBuilder<number>();
    var numberArray: number[] = [1, 2, 3];
    var numberResult = fromNumberBuilder.buildFromArray(numberArray);

    // 
    class Person {
        private _name: string;
        constructor(name: string) {
            this._name = name;
        }
        // объект должен переопределять метод toString, чтобы обеспечить читабельный вывод
        toString(): string {
            return this._name;
        }
    }

    // T - объект
    let personArray: Person[] = [new Person('p1'), new Person('p2'), new Person('p3')];
    let fromPersonBuilder = new StringBuilder<Person>();
    let personResult = fromPersonBuilder.buildFromArray(personArray);

    // Ограничение типа Т - обобщенный тип можно ограничивать конкретным типом или подмножеством типов
    enum Country { England, Germany }
    interface IClub {
        getName(): string | undefined;
        getCountry(): Country | undefined;
    }
    abstract class AbstractClub implements IClub {
        protected _name: string | undefined;
        protected _country: Country | undefined;
        getName() { return this._name };
        getCountry() { return this._country };
    }
    class FirstClub extends AbstractClub {
        constructor() {
            super();
            this._name = "first";
            this._country = Country.England;
        }
    }
    class SecondClub extends AbstractClub {
        constructor() {
            super();
            this._name = "second";
            this._country = Country.Germany;
        }
    }

    // Обобщенные интерфейсы
    interface IClubRender<T extends IClub> {
        Render(arg: T): void;
        IsEngland(arg: T): string;
    }

    // ограничение типа Т конкретным типом, который выводится из другого типа, используя синтаксис extends
    // если T расширяет указанный тип, то обобщенный код может предполагать, что T относится к этому типу

    // тип T является производным от интерфейса IClub
    class ClubRender<T extends IClub> implements IClubRender<T> {
        // любое использование типа T будет заменять интерфейс IClub, т.е. на типе Т можно будет 
        //      вызывать только методы определенные в интерфейсе IClub
        Render(arg: T) {
            console.log(`${arg.getName()} --- is England = ${this.IsEngland(arg)}`);
        }
        IsEngland(arg: T): string {
            return (arg.getCountry() === Country.England) ? 'yes' : 'no';
        }
    }

    // ошибочное определение класса: здесь тип T должен быть ограничен интерфейсом IClub (T extends IClub), 
    //      так как этого требует интерфейс IClubRender, следующее объявление ошибочно:
    //      class ClubRender<T> implements IClubRender<T> { }

    // 
    let clubRender = new ClubRender();
    clubRender.Render(new FirstClub());
    clubRender.Render(new SecondClub());

    // создание экземпляров обобщенного типа
    class GenericCreator<T> {
        // Аргумент trick передаваемый в функцию определяется как тип '{ new(name: string): T }', т.е. определяется новый тип, который
        //      перегружает функцию new() и возвращает тип T. Аргумент trick это строго типизированная функция с одним конструктором, 
        //      который возвращает тип T. Реализация этой функции возвращает новый экземпляр переменной trick.
        create_right(trick: { new(name: string): T }): T {
            return new trick('new name');
        }
        // а эта версия вызовет ошибку
        //      create_wrong(): T {
        //          return new T();
        //      }
    }
    let genericCreator = new GenericCreator<Person>();
    let newPerson: Person = genericCreator.create_right(Person);
    // Согласно документации TypeScript, чтобы дать возможность обобщенному классу создавать объекты типа T, 
    // нужно обратиться к типу T посредством его функции-конструктора и передать определение класса в качестве аргумента.
}

// --------------- Расширенные типы ('математика теоретических типов')

namespace theoretical_types {

    // --- Условные типы - вывод типа происходит по результатам условного оператора
    //      если тип T расширяет число, то результирующий тип будет number 
    //      если тип T не расширяет число, то результирующий тип будет string
    type numberOrString<T> = T extends number ? number : string;
    // в зависимости от типа T входной параметр функции может быть числом или строкой
    //      параметр input является условным для типа T
    function isNumberOrString<T>(input: numberOrString<T>) {
        console.log(`numberOrString : ${input}`);
    }
    isNumberOrString<number>(1);
    isNumberOrString<string>("test");

    // пример сложнее
    interface a { a: number; }
    interface ab { a: number; b: string; }
    interface abc { a: number; b: string; c: boolean; }
    // условный тип вернет кортеж или never, что приведет к ошибке
    type abc_ab_a<T> =
        T extends abc ? [number, string, boolean] :
        T extends ab ? [number, string] :
        T extends a ? [number] :
        never;
    // функция принимает аргумент, который может быть кортежом из 1-3 элементов
    function getKeyAbc<T>(key: abc_ab_a<T>): string {
        // spread-кортеж для извлечения значений аргумента key 
        let [...args] = key;
        return args.join(':');
    }
    // демонстрация
    console.log(`key10 : ${getKeyAbc<a>([1])}`);
    console.log(`key20 : ${getKeyAbc<ab>([1, "test"])}`);
    console.log(`key30 : ${getKeyAbc<abc>([1, "test2", true])}`);

    // --- Распределенные условные типы - это зависимости между различными типами
    // зависимость типа параметра secondArg от типа параметра firstArg:
    //      firstArg: Date    =>  secondArg: Date
    //      firstArg: number  =>  secondArg: number | Date
    //      firstArg: string  =>  secondArg: number | Date | string
    type dateNumberString<T> =
        T extends Date ? Date :
        T extends number ? Date | number :
        T extends string ? Date | number | string : never;
    function distributedTypes<T extends string | number | Date | boolean>(firstArg: T, secondArg: dateNumberString<T>) { }
    // допустимые вызовы
    distributedTypes(new Date(), new Date());
    distributedTypes(1, 1);
    distributedTypes(1, Date.now());
    // не допустимые вызовы
    //      distributedTypes(new Date(), 1);
    //      distributedTypes(new Date(), "1");
    //      distributedTypes(1, "1");
    //      distributedTypes(true, "test");

    // --- Выведение условных типов - тип параметра может быть извлечен при помощи ключевого слова infer

    // условный тип проверяет, является ли тип T массивом и если это так, то infer выводит тип с именем U
    //      имена выводимых типов (U) могут использоваться только внутри условного типа
    type extractArrayType<T> = T extends (infer U)[] ? U : never;
    let stringType: extractArrayType<["test"]> = "test";
    // ошибка:
    //      let stringTypeNoArray : extractArrayType<"test"> = "test";

    // InferredAb проверяет есть ли у нашего типа свойства a и b, если это так, он выведет тип U из свойств a и b
    type InferredAb<T> = T extends { a: infer U, b: infer U } ? U : T;
    // объявления 'a: infer U' и 'b: infer U' вернут числа, значит переменная abinf будет иметь тип number
    type abInferredNumber = InferredAb<{ a: number, b: number }>;
    let abinf: abInferredNumber = 1;
    // объявления 'a: infer U' и 'b: infer U' вернут число и строку, значит abinfstr будет иметь тип 'number | string'
    type abInferredNumberString = InferredAb<{ a: number, b: string }>;
    let abinfstr: abInferredNumberString = 1;
    abinfstr = "test";

    // --- keyof - возвращает строковый литерал, состоящий из имен свойств

    // при каждом изменении IPerson необходимо будет изменять литерал propertyLiteral
    interface IPerson {
        id: number;
        name: string;
        surname: string;
    }
    type propertyLiteral = "id" | "name" | "surname";
    // функция вывод которой ограничен строковыми значениями "id", "name" и "surname"
    function usingStringLiteral(ppl: propertyLiteral, value: IPerson) {
        console.log(`${ppl} : ${value[ppl]}`)
    }

    // keyof автоматически создает строковый литерал из свойств типа IPerson
    function usingKeyof(key: keyof IPerson, value: IPerson): void {
        console.log(`${key} : ${value[key]}`);
    }
    let testPerson: IPerson = { id: 1, name: "test", surname: "true" };
    usingKeyof("id", testPerson);
    usingKeyof("name", testPerson);
    usingKeyof("surname", testPerson);

    // --- keyof с числовым свойством
    enum Currency { AUD = 36, PLN = 985, USD = 840 }
    const CurrencyName = { [Currency.AUD]: "Australian Dollar", [Currency.PLN]: "Zloty" }
    console.log(`CurrencyName[Currency.AUD] = ${CurrencyName[Currency.AUD]} --- CurrencyName[36] = ${CurrencyName[36]}`);

    // ключевое слово keyof используется для генерации числового литерала
    //      'K extends keyof T' означает, что K должен быть числовым литералом, полученным из числовых свойств T
    //      функция возвращает T[K] - свойство с именем K из типа T
    function getCurrencyName<T, K extends keyof T>(key: K, map: T): T[K] {
        return map[key];
    }
    console.log(`
        --- AUD name = ${getCurrencyName(Currency.AUD, CurrencyName)}
        --- PLN name = ${getCurrencyName(Currency.PLN, CurrencyName)}`);

    // --- Отображаемые типы

    interface abc { a: number; b: string; c: boolean; }
    // мы отобразили тип T в новый тип и преобразовали все свойства типа T в необязательные свойства
    type PartialProps<T> = {
        // используется символ '?', чтобы пометить все свойства типа T как необязательные
        [K in keyof T]?: T[K];
    }
    type IPartialAbc = PartialProps<abc>;
    let abNoCObject: IPartialAbc = { a: 1, b: "test" };
    let aNoBcObject: IPartialAbc = { a: 1 };

    // --- Partial / Readonly / Record / Pick

    // Partial<T> используется для создания типа, в котором все свойства T не являются обязательными
    type partialAbc = Partial<abc>;

    // ReadOnly<T> используется для создания типа, где все свойства T являются только для чтения
    type readonlyAbc = Readonly<abc>;

    // Pick<T, K extends keyof T> используется для создания типа, который является подмножеством свойств другого типа
    type Pick<T, K extends keyof T> = {
        [P in K]: T[P];
    };
    // создание нового типа из интерфейса abc и включающего в себя только два свойства abc из трех
    type pickAb = Pick<abc, "a" | "b">;
    let pickAbObject: pickAb = { a: 1, b: "test" };
    // не допустимый вызов
    //      let pickAcObject: pickAb = { a: 1, c: true };

    // Record<K extends keyof any, T> используется для создания типов из указанных свойств с заданным типом
    type Record<K extends keyof any, T> = {
        [P in K]: T;
    };
    // создание типа, у которого есть свойства a и c типа string
    type recordAc = Record<"a" | "c", string>;
    let recordAcObject: recordAc = { a: "test", c: "test" };
    // не допустимый вызов
    //      let recordAcNumbers: recordAc = { a: 1, c: "test" };
}


