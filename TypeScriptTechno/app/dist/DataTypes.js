"use strict";
// TypeScript использует сильную типизацию в JavaScript, т.е. тип переменной не может быть 
// изменен после ее поределения. Сильная типизация реализуется за счет синтаксиса
// называемого 'аннотацией типа' (Андерс Хейлсберг называет это 'синтаксическим сахаром') и
// используется везде, где применяется переменная.
// JavaScript является динамически типизированным языком, т.е. тип переменной определяется
// операцией присваивания интерпретатором JavaScript.
// --------------- Синтаксис типов
var data_types;
(function (data_types) {
    // типы в классе
    class DataTypesClass {
        // конструктор
        constructor() {
            // анотация типов: any
            this.item1 = { id: 1, name: "item 1" };
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
        doCalculation(a, b, c) {
            return (a * b) + c;
        }
        // Анонимные функции
        anonymousFunctions() {
            console.log(`data_types --- анонимные функции`);
            // анонимные функции определяются на лету без имени
            let addFunction = function (a, b) {
                return a + b;
            };
            // Необязательные параметры - позволяют вызывать функции с отсутствующими параметрами
            let concatStrings = function (a, b, c) {
                return a + b + c;
            };
            console.log(`concatstrings("a", "b", "c") : ${concatStrings("a", "b", "c")}`);
            console.log(`concatstrings("a", "b") : ${concatStrings("a", "b")}`);
            // Параметры по умолчанию
            let concatStringsDefault = function (a, b, c = "c") {
                return a + b + c;
            };
            console.log(`defaultConcat("a", "b") : ${concatStringsDefault("a", "b")}`);
            // Оставшиеся параметры (эквивалент arguments)
            // Каждая функция JavaScript имеет доступ к специальной переменной с именем arguments,
            //      которая содержит массив всех переданных в функцию аргументов,
            let testArguments = function (...argArray) {
                // TypeScript будет рассматривать любой элемент массива argArray как число, однако
                // массив arguments будет рассматриваться как тип any, так как у него нет выводимого типа
                if (argArray.length > 0) {
                    for (var i = 0; i < argArray.length; i++) {
                        // arguments все еще доступна для использования в TypeScript
                        console.log(`arguments[${i}] = ${arguments[i]}`); // JavaScript
                        console.log(`argArray[${i}] = ${argArray[i]}`); // TypeScript
                    }
                }
            };
            // Функция обратного вызова
            // программисты на JavaScript должны: 
            //      1. кодировать недопустимое использование функций обратного вызова (typeof callback === "function")
            //      2. документировать сигнатуры, как обратных функций, так и использующих их функций
            let callbackFunction = function (text, callback) {
                // void – это ключевое слово, которое обозначает, что функция не возвращает значение
                console.log(`inside --- ${text}`);
                callback(text);
            };
            callbackFunction('message', (text) => console.log(`callback --- ${text}`));
            //      - последнее определение использует спецификатор типа any и включает тело функции
            //      - по существу, данная сигнатура скрыта, а на самом деле используются две предыдущие
            function add(a, b) {
                return a + b;
            }
            console.log(`--- add(1, 1) = ${add(1, 1)} --- add("1", "1") = ${add("1", "1")}`);
            // try...catch...finally работает точно так же
            try {
                console.log(`try`);
                throw Error();
            }
            catch (error) {
                console.log(`catch: ${error}`);
            }
            finally {
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
    let complexType1 = { name: "myName", id: 1 }; // вывод типа
    complexType1 = { id: 2, name: "anotherName" }; // утиная типизация
    // явное приведение типов
    var complexType2 = { id: 1, name: "item 1" }; // объект в правой части присваивания рассматривается как тип any
    complexType2 = { id: 2 };
    // Перечисления – это специальный тип, enum связывает удобочитаемое имя и специальное число,
    //      в сгенерированном коде каждому значению перечисления назначается число
    let DoorState;
    (function (DoorState) {
        DoorState[DoorState["Open"] = 0] = "Open";
        DoorState[DoorState["Closed"] = 1] = "Closed";
        DoorState[DoorState["Ajar"] = 10] = "Ajar";
    })(DoorState || (DoorState = {}));
    ;
    console.log(`data_types --- перечисления`);
    console.log(`data_types --- openDoor is: ${DoorState.Open}`); // 0
    console.log(`data_types --- closedDoor is : ${DoorState["Closed"]}`); // 1
    console.log(`data_types --- ajarDoor is : ${DoorState[2]}`); // Ajar
    ;
    console.log(`constDoorOpen is : ${"open" /* Open */}`);
    // const и let работают как и в JavaScript:
    // const - значение переменной не может быть изменено после ее определения
    // let - задает область видимости переменной на уровне блока, и переменная 
    //      не может использоваться до ее определения 
    // утверждение присваивания - говорит компилятору, что мы утверждаем, что переменная была 
    //      назначена и что она не должна вызывать ошибку, если она использовалась до назначения,
    //      синтаксис утверждения присваивания заключается в добавлении '!'
    let globalString; // при объявлении переменной
    setGlobalString();
    console.log(`globalString : ${globalString}`); // при использовании переменной
    function setGlobalString() {
        globalString = "this has been set";
    }
    // Типы свойств с точечной нотацией
    // stringObject.testProperty и stringObject["testProperty"] для TypeScript одно и тоже
    // Числовые разделители ECMAScript - подчеркивание '_' при определении больших чисел
    console.log(`oneMillion = ${1000000}`);
})(data_types || (data_types = {}));
// --------------- Расширенные типы
var extended_types;
(function (extended_types) {
    // Объединенные типы - позволяет выражать тип как комбинацию двух или более типов,
    //      путем перечисления всех типов через символ '|'
    let unionType;
    unionType = 1;
    console.log(`unionType : ${unionType}`);
    unionType = "test";
    console.log(`unionType : ${unionType}`);
    // Охранник типов – это выражение, которое выполняет проверку типа, а затем гарантирует этот тип 
    //      в своей области видимости.
    function addTypeGuard(arg1, arg2) {
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
    function addWithAlias(arg1, arg2, callback) {
        callback("this is a string");
        return arg1.toString() + arg2.toString();
    }
    // Null и undefined
    // В JavaScript:
    //      undefined - либо переменная не объявлена, либо ей не присвоено значение
    //      null - переменная объявлена, известен тип переменной, но не имеет значения
    function testNullUndefined(testNull, testUndefined) {
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
    function alwaysThrows() {
        // функция всегда выдает ошибку и никогда не возвращает значения
        // чтобы обезопасить код используется тип never в определении функции
        throw "this will always throw";
        // return -1; 
    }
    // более практичным использованием never является устранение недостатков в логике кода
    let TestNeverEnum;
    (function (TestNeverEnum) {
        TestNeverEnum[TestNeverEnum["FIRST"] = 0] = "FIRST";
        TestNeverEnum[TestNeverEnum["SECOND"] = 1] = "SECOND";
    })(TestNeverEnum || (TestNeverEnum = {}));
    ;
    function getEnumValue(value) {
        switch (value) {
            case TestNeverEnum.FIRST: return "First case";
            case TestNeverEnum.SECOND: return "Second case";
        }
        // ошибка логики
        // если в перечисление TestNeverEnum будет добавлено новое значение, то
        // эта строка будет выдавать ошибку (тип TestNeverEnum не равен never)
        let returnValue = value;
    }
    // Unknown
    //      тип unknown рассматривается как безопасная версия типа any, так как 
    //      требует приведения из неизвестного типа к известному
    // переменная типа unknown ведет себя как переменная типа any
    let unknownType = "an unknown string";
    console.log(`unknownType : ${unknownType}`);
    unknownType = 1;
    console.log(`unknownType : ${unknownType}`);
    // чтобы присвоить unknownType переменной типа number, нужно выполнить приведение типа
    let numberType = unknownType;
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
})(extended_types || (extended_types = {}));
// --------------- Обобщения
var generic;
(function (generic) {
    // Обобщения – это способ написания кода, который будет иметь дело с любым типом объекта, но при этом сохранит целостность данного типа. 
    // Термин обобщение, по существу, означает параметризированный тип. Особая роль параметризированных типов состоит в том, что они позволяют создавать классы, структуры, интерфейсы, методы и делегаты, в которых обрабатываемые данные указываются в виде параметра.
    // https://professorweb.ru/my/csharp/charp_theory/level11/11_1.php#:~:text=%D0%A2%D0%B5%D1%80%D0%BC%D0%B8%D0%BD%20%D0%BE%D0%B1%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5%2C%20%D0%BF%D0%BE%20%D1%81%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D1%83%2C%20%D0%BE%D0%B7%D0%BD%D0%B0%D1%87%D0%B0%D0%B5%D1%82,%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5%20%D1%83%D0%BA%D0%B0%D0%B7%D1%8B%D0%B2%D0%B0%D1%8E%D1%82%D1%81%D1%8F%20%D0%B2%20%D0%B2%D0%B8%D0%B4%D0%B5%20%D0%BF%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D0%B0.
    // в качестве T можно использовать любой тип, Т называется обощенным типом
    class StringBuilder {
        buildFromArray(arrayT) {
            if (arrayT.length === 0)
                return '';
            // можно применять только те методы обобщенного массива, которые являются общими для всех массивов
            let returnString = arrayT[0].toString();
            for (let i = 1; i < arrayT.length; i++) {
                returnString += `, ${arrayT[i].toString()}`;
            }
            return returnString;
        }
    }
    // Т - строка
    var fromStringBuilder = new StringBuilder();
    var stringArray = ["first", "second", "third"];
    var stringResult = fromStringBuilder.buildFromArray(stringArray);
    // Т - число
    var fromNumberBuilder = new StringBuilder();
    var numberArray = [1, 2, 3];
    var numberResult = fromNumberBuilder.buildFromArray(numberArray);
    // 
    class Person {
        constructor(name) {
            this._name = name;
        }
        // объект должен переопределять метод toString, чтобы обеспечить читабельный вывод
        toString() {
            return this._name;
        }
    }
    // T - объект
    let personArray = [new Person('p1'), new Person('p2'), new Person('p3')];
    let fromPersonBuilder = new StringBuilder();
    let personResult = fromPersonBuilder.buildFromArray(personArray);
    // Ограничение типа Т - обобщенный тип можно ограничивать конкретным типом или подмножеством типов
    let Country;
    (function (Country) {
        Country[Country["England"] = 0] = "England";
        Country[Country["Germany"] = 1] = "Germany";
    })(Country || (Country = {}));
    class AbstractClub {
        getName() { return this._name; }
        ;
        getCountry() { return this._country; }
        ;
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
    // ограничение типа Т конкретным типом, который выводится из другого типа, используя синтаксис extends
    // если T расширяет указанный тип, то обобщенный код может предполагать, что T относится к этому типу
    // тип T является производным от интерфейса IClub
    class ClubRender {
        // любое использование типа T будет заменять интерфейс IClub, т.е. на типе Т можно будет 
        //      вызывать только методы определенные в интерфейсе IClub
        Render(arg) {
            console.log(`${arg.getName()} --- is England = ${this.IsEngland(arg)}`);
        }
        IsEngland(arg) {
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
    class GenericCreator {
        // Аргумент trick передаваемый в функцию определяется как тип '{ new(name: string): T }', т.е. определяется новый тип, который
        //      перегружает функцию new() и возвращает тип T. Аргумент trick это строго типизированная функция с одним конструктором, 
        //      который возвращает тип T. Реализация этой функции возвращает новый экземпляр переменной trick.
        create_right(trick) {
            return new trick('new name');
        }
    }
    let genericCreator = new GenericCreator();
    let newPerson = genericCreator.create_right(Person);
    // Согласно документации TypeScript, чтобы дать возможность обобщенному классу создавать объекты типа T, 
    // нужно обратиться к типу T посредством его функции-конструктора и передать определение класса в качестве аргумента.
})(generic || (generic = {}));
// --------------- Расширенные типы ('математика теоретических типов')
var theoretical_types;
(function (theoretical_types) {
    // в зависимости от типа T входной параметр функции может быть числом или строкой
    //      параметр input является условным для типа T
    function isNumberOrString(input) {
        console.log(`numberOrString : ${input}`);
    }
    isNumberOrString(1);
    isNumberOrString("test");
    // функция принимает аргумент, который может быть кортежом из 1-3 элементов
    function getKeyAbc(key) {
        // spread-кортеж для извлечения значений аргумента key 
        let [...args] = key;
        return args.join(':');
    }
    // демонстрация
    console.log(`key10 : ${getKeyAbc([1])}`);
    console.log(`key20 : ${getKeyAbc([1, "test"])}`);
    console.log(`key30 : ${getKeyAbc([1, "test2", true])}`);
    function distributedTypes(firstArg, secondArg) { }
    // допустимые вызовы
    distributedTypes(new Date(), new Date());
    distributedTypes(1, 1);
    distributedTypes(1, Date.now());
    let stringType = "test";
    let abinf = 1;
    let abinfstr = 1;
    abinfstr = "test";
    // функция вывод которой ограничен строковыми значениями "id", "name" и "surname"
    function usingStringLiteral(ppl, value) {
        console.log(`${ppl} : ${value[ppl]}`);
    }
    // keyof автоматически создает строковый литерал из свойств типа IPerson
    function usingKeyof(key, value) {
        console.log(`${key} : ${value[key]}`);
    }
    let testPerson = { id: 1, name: "test", surname: "true" };
    usingKeyof("id", testPerson);
    usingKeyof("name", testPerson);
    usingKeyof("surname", testPerson);
    // --- keyof с числовым свойством
    let Currency;
    (function (Currency) {
        Currency[Currency["AUD"] = 36] = "AUD";
        Currency[Currency["PLN"] = 985] = "PLN";
        Currency[Currency["USD"] = 840] = "USD";
    })(Currency || (Currency = {}));
    const CurrencyName = { [Currency.AUD]: "Australian Dollar", [Currency.PLN]: "Zloty" };
    console.log(`CurrencyName[Currency.AUD] = ${CurrencyName[Currency.AUD]} --- CurrencyName[36] = ${CurrencyName[36]}`);
    // ключевое слово keyof используется для генерации числового литерала
    //      'K extends keyof T' означает, что K должен быть числовым литералом, полученным из числовых свойств T
    //      функция возвращает T[K] - свойство с именем K из типа T
    function getCurrencyName(key, map) {
        return map[key];
    }
    console.log(`
        --- AUD name = ${getCurrencyName(Currency.AUD, CurrencyName)}
        --- PLN name = ${getCurrencyName(Currency.PLN, CurrencyName)}`);
    let abNoCObject = { a: 1, b: "test" };
    let aNoBcObject = { a: 1 };
    let pickAbObject = { a: 1, b: "test" };
    let recordAcObject = { a: "test", c: "test" };
    // не допустимый вызов
    //      let recordAcNumbers: recordAc = { a: 1, c: "test" };
})(theoretical_types || (theoretical_types = {}));
//# sourceMappingURL=DataTypes.js.map