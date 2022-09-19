// --------------- отладка тестов через chrome

// сделать запись в scripts файла package.json:
//      "only-test": "mocha --inspect-brk test/test_express.js"
// запустить тесты:
//      npm run only-test
// запустить в хроме и выбрать Remote Target:
//      chrome://inspect
// остановка в коде:
//      debugger

// --------------- исходники 

try {
    describe('express application', () => {

        // Before each test we empty the database
        beforeEach((done) => {
            debugger;
            done();
        });

        // Test the /GET route
        describe('/GET book', () => {

            it('it should GET all the books', (done) => {
                chai.request(app)
                    .get('/book')
                    .end((err, res) => {
                        debugger;
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(0);
                        done();
                    });
            });
        });
    });
}
catch (err) {
    console.log(err);
}

// --------------- цепочка get функций

// следующие функции ничего не делают в цепочке вызовов, нужны для улучшения читабельности
//      to, be, been, is, that, which, and, has, have, with, at, of, same, but, does, still, also

// --------------- доступные методы

// .not                             - отрицание
// .deep                            - глубокое сравнение / equal, include, members, keys, property
// .nested                          - альтернативная нотация
// .own                             - игнорировать наследуемые свойства / property, include
// .ordered                         - упорядоченное сравнение / members, include
// .any                             - любой / keys
// .all                             - все / keys
// .a                               - соответствие типа
// .include                         - сравнение в подмножестве
// .ok                              - цель является истинным значением
// .true                            - цель это true
// .false                           - цель это false
// .null                            - цель это null
// .undefined                       - цель это undefined
// .NaN                             - цель это NaN
// .exist                           - цель не равно null или undefined
// .empty                           - размерность цели равна 0 / строка, массив, set, map, объект
// .arguments                       - цель это arguments
// .equal                           - равенство (===)
// .eql                             - равенство (deep)
// .above                           - >
// .least                           - >=
// .below                           - <
// .most                            - <=
// .within                          - диапозон
// .instanceof                      - объект является экземпляром
// .property                        - объект содержит свойство
// .ownPropertyDescriptor           - объект содержит дескриптор свойства
// .lengthOf                        - размерность цели / строка, массив, set, map
// .match                           - регулярное выражение
// .string                          - подстрока
// .keys                            - наличие ключей / объект, массив, map, set / deep, any, all, include
// .throw                           - цель возбуждает ошибку
// .respondTo                       - у цели есть метод
// .itself                          - используется с respondTo
// .satisfy                         - функция возвращает истину
// .closeTo                         - число в диапозоне
// .members                         - содержание массива / deep, ordered, include
// .oneOf                           - цель содержится в массиве
// .change                          - изменения после вызова функции
// .increase                        - большее значение после вызова функции
// .decrease                        - меньшее значение после вызова функции
// .by                              - величина изменения после применения: change, increase, decrease
// .extensible                      - цель является расширяемой
// .sealed                          - целья является sealed
// .frozen                          - целья является frozen
// .finite                          - цель является числом
// .fail                            - вызвать ошибку

// --------------- chai

// если expect / should возбуждает 
const chai = require('chai');
const expect = chai.expect;

// --------------- not

// отменяет все утверждения, следующие в цепочке
expect(function () { }).to.not.throw();                         // функция не вызывает исключения
expect({ a: 1 }).to.not.have.property('b');                     // объект не содержит свойства: b
expect([1, 2]).to.be.an('array').that.does.not.include(3);      // массив не содержит: 3
expect(2).to.equal(2);                                          // Recommended
expect(2).to.not.equal(1);                                      // Not recommended

// --------------- deep

// глубокое но не строгое равенство сравнение объектов
// добавление deep к equal / include / members / keys / property

expect({ a: 1 }).to.deep.equal({ a: 1 });                           // целевой объект сравнивается с указанным
expect({ a: 1 }).to.not.equal({ a: 1 });                            // ! без deep выполняется не правильно

expect([{ a: 1 }]).to.deep.include({ a: 1 });                       // целевой массив содержит указанный объект
expect([{ a: 1 }]).to.not.include({ a: 1 });                        // ! без deep выполняется не правильно

expect({ x: { a: 1 } }).to.deep.include({ x: { a: 1 } });           // целевой объект содержит свойства указанного объекта
expect({ x: { a: 1 } }).to.not.include({ x: { a: 1 } });            // ! без deep выполняется не правильно

expect([{ a: 1 }]).to.have.deep.members([{ a: 1 }]);                // целевой массив является надмножеством указанного массива
expect([{ a: 1 }]).to.not.have.members([{ a: 1 }]);                 // ! без deep выполняется не правильно

expect(new Set([{ a: 1 }])).to.have.deep.keys([{ a: 1 }]);          // 
expect(new Set([{ a: 1 }])).to.not.have.keys([{ a: 1 }]);           // ! без deep выполняется не правильно

expect({ x: { a: 1 } }).to.have.deep.property('x', { a: 1 });       // целевой объект содержит указанное свойство с указанным значением
expect({ x: { a: 1 } }).to.not.have.property('x', { a: 1 });        // ! без deep выполняется не правильно

// использует пакет deep-eql
//      https://github.com/chaijs/deep-eql

// --------------- nested

// позволяет использовать dot- и bracket- нотации для указания объектов равенства
// нельзя использовать совместно с own

expect({ a: { b: ['x', 'y'] } }).to.have.nested.property('a.b[1]');             // свойство a -> свойтсво b -> элемент массива с индексом 1
expect({ a: { b: ['x', , 'y'] } }).to.have.nested.property('a.b[1]');           // вызовет ошибку, разряженный массив, элемент с индексом 1 пропущен
expect({ a: { b: ['x', 'y'] } }).to.nested.include({ 'a.b[1]': 'y' });          // дополнительная проверка значения указанного свойства

expect({ '.a': { '[b]': 'x' } }).to.have.nested.property('\\.a.\\[b\\]');       // позволяет указывать символ '.' в названии
expect({ '.a': { '[b]': 'x' } }).to.nested.include({ '\\.a.\\[b\\]': 'x' });    // позволяет указывать символы '[' и ']' в названии

// --------------- own

// позволяет игнорировать унаследованные свойства для object.protptype
// используется с property и include

Object.prototype.b = 2;

expect({ a: 1 }).to.have.own.property('a');
expect({ a: 1 }).to.have.property('b');
expect({ a: 1 }).to.not.have.own.property('b');

expect({ a: 1 }).to.own.include({ a: 1 });
expect({ a: 1 }).to.include({ b: 2 }).but.not.own.include({ b: 2 });

// --------------- ordered

// позволяет указывать правильную последовательность элементов при использовании members и include

expect([1, 2])
    .to.have.ordered.members([1, 2])            // массив [1, 2] упорядочен так же как [1, 2]
    .but.not.have.ordered.members([2, 1]);      // но не [2, 1]

// сравнение начинается с начала массива, если указать include
expect([1, 2, 3])
    .to.include.ordered.members([1, 2])
    .but.not.include.ordered.members([2, 3]);

// --------------- any

// наличие хотя бы одного свойства в объекте

expect({ a: 1, b: 2 }).to.not.have.any.keys('c', 'd');        // not - отсутствие всех свойств в объекте
expect({ a: 1, b: 2 }).to.have.any.keys('c', 'd', 'a');       // наличие хотя бы одного свойства в объекте

// --------------- all

// объект должен содержать все указанные свойства

expect({ a: 1, b: 2 }).to.have.all.keys('a', 'b');

// --------------- a/an

// тип целевого объекта должен соответствовать указанному
// может использовать как часть цепочки: to.have.a.property
// an псевдоним a

expect('foo').to.be.a('string');
expect({ a: 1 }).to.be.an('object');
expect(null).to.be.a('null');
expect(undefined).to.be.an('undefined');
expect(new Error).to.be.an('error');
expect(Promise.resolve()).to.be.a('promise');
expect(new Float32Array).to.be.a('float32array');
expect(Symbol()).to.be.a('symbol');

// кастомный тип
var myObj = { [Symbol.toStringTag]: 'myCustomType' };
expect(myObj).to.be.a('myCustomType').but.not.an('object');

// проверка типа перед другими проверками
expect([1, 2, 3]).to.be.an('array').that.includes(2);
expect([]).to.be.an('array').that.is.empty;

// пакет type-detect
//      https://github.com/chaijs/type-detect

// --------------- include

// целевой объект включает указанную часть
// псевдонимы: include, includes, contain, contains

expect('foobar').to.include('foo');
expect([1, 2, 3]).to.include(2);                            // МАССИВ.
expect({ a: 1, b: 2, c: 3 }).to.include({ a: 1, b: 2 });    // ОБЪЕКТ. свойства указанного объекта являются подмножеством целевого объекта
expect(new Set([1, 2])).to.include(2);                      // работает для Set и WeakSet, алгоритм SameValueZero для определения равенста
expect(new Map([['a', 1], ['b', 2]])).to.include(2);        // указанное значение содержится в целевой Map, алгоритм SameValueZero для определения равенста

// использование deep с include
expect([{ a: 1 }]).to.deep.include({ a: 1 });               // МАССИВ. deep
expect({ x: { a: 1 } }).to.deep.include({ x: { a: 1 } });   // ОБЪЕКТ. deep

// указав include в цепочке можно определить целевой объект как надмножество над указанным в проверке
expect({ a: 1, b: 2, c: 3 }).to.include.all.keys('a', 'b');         // {a: 1, b: 2, c: 3} надмножество ['a', 'b']
expect({ a: 1, b: 2, c: 3 }).to.not.have.all.keys('a', 'b');
expect({ a: 1, b: 2, c: 3 }).to.all.keys('a', 'b');                 // ! вызовет ошибку, целевой объект содержит три свойства: a, b, c

expect([1, 2, 3]).to.include.members([1, 2]);
expect([1, 2, 3]).to.not.have.members([1, 2]);
expect([1, 2, 3]).to.include.members([1, 2, 2, 2]);

// --------------- реализация SameValueZero

// https://question-it.com/questions/586101/kak-rabotaet-algoritm-s-nulevym-znacheniem

const sameValueZero = (x, y) => x === y || (Number.isNaN(x) && Number.isNaN(y));
console.log('(0, 0) --- ' + sameValueZero(0, 0));
console.log('(0, 1) --- ' + sameValueZero(0, 1));
console.log('(0, NaN) --- ' + sameValueZero(0, NaN));
console.log('(NaN, NaN) --- ' + sameValueZero(NaN, NaN));

// --------------- ok

// утверждает что цель является истинным значением
// рекомендуется указывать явные значения вместо ok

expect(1).to.equal(1);              // Recommended
expect(1).to.be.ok;                 // Not recommended

expect(true).to.be.true;            // Recommended
expect(true).to.be.ok;              // Not recommended

expect(0).to.equal(0);              // Recommended
expect(0).to.not.be.ok;             // Not recommended

expect(false).to.be.false;          // Recommended
expect(false).to.not.be.ok;         // Not recommended

expect(null).to.be.null;            // Recommended
expect(null).to.not.be.ok;          // Not recommended

expect(undefined).to.be.undefined;  // Recommended
expect(undefined).to.not.be.ok;     // Not recommended

// --------------- true

// утверждает, что цель строго (===) равна true
expect(true).to.be.true;

// --------------- false

// утверждает, что цель строго (===) равна false
expect(false).to.be.false;

// --------------- null

// утверждает, что цель строго (===) равна null
expect(null).to.be.null;

// --------------- undefined

// утверждает, что цель строго (===) равна undefined
expect(undefined).to.be.undefined;

// --------------- NaN

// утверждает, что цель строго (===) равна NaN
expect(NaN).to.be.NaN;

// --------------- exist

// утверждает, что цель строго (===) не равна ни null, ни undefined
expect(1).to.equal(1);      // рекомендуется явно указывать значение
expect(1).to.exist;

// --------------- empty

// для строки и массива утверждает что свойство length строго (===) равно 0
expect([]).to.be.empty;
expect('').to.be.empty;

// для Set и Map утверждает что свойство size строго (===) равно 0
expect(new Set()).to.be.empty;
expect(new Map()).to.be.empty;

// для объекта утверждает что у объекта нет свойств, исключая символьные свойства
expect({}).to.be.empty;

// --------------- замена для empty

expect([1, 2, 3]).to.have.lengthOf(3);                      // Recommended
expect([1, 2, 3]).to.not.be.empty;                          // Not recommended

expect(new Set([1, 2, 3])).to.have.property('size', 3);     // Recommended
expect(new Set([1, 2, 3])).to.not.be.empty;                 // Not recommended

expect(Object.keys({ a: 1 })).to.have.lengthOf(1);          // Recommended
expect({ a: 1 }).to.not.be.empty;                           // Not recommended

// --------------- arguments

// утверждает, что целью является объект arguments

function test() {
    expect(arguments).to.be.arguments;
}
test();

// --------------- equal

// утверждает, что цель строго (===) равна заданному значению
// псевдонимы: equals, eq, equal

expect(1).to.equal(1);
expect('foo').to.equal('foo');
expect({ a: 1 }).to.deep.equal({ a: 1 });
expect([1, 2]).to.deep.equal([1, 2]);

// --------------- eql

// deep-версия equal, выполняет глубокое сравнение
// псевдонимы: eqls, eql
// цепочка .deep.equal похожа на .eql, с той разницей, что deep выполняет глубокое сравнение для всех утверждений после себя

expect({ a: 1 })
    .to.eql({ a: 1 })
    .but.not.equal({ a: 1 });

expect([1, 2])
    .to.eql([1, 2])
    .but.not.equal([1, 2]);

// --------------- above

// утверждает что цель больше чем указанное число или дата
// псевдонимы: gt, greaterThan

expect(2).to.equal(2);                          // Recommended
expect(2).to.be.above(1);                       // Not recommended

expect('foo').to.have.lengthOf(3);              // Recommended
expect('foo').to.have.lengthOf.above(2);        // Not recommended

expect([1, 2, 3]).to.have.lengthOf(3);          // Recommended
expect([1, 2, 3]).to.have.lengthOf.above(2);    // Not recommended

// --------------- least

// утверждает что цель больше или равно указанного числа или даты
// псевдонимы: gte, greaterThanOrEqual

expect(2).to.equal(2);                              // Recommended
expect(2).to.be.at.least(1);                        // Not recommended
expect(2).to.be.at.least(2);                        // Not recommended

expect('foo').to.have.lengthOf(3);                  // Recommended
expect('foo').to.have.lengthOf.at.least(2);         // Not recommended

expect([1, 2, 3]).to.have.lengthOf(3);              // Recommended
expect([1, 2, 3]).to.have.lengthOf.at.least(2);     // Not recommended

// --------------- below 

// утверждает, что целью является число или дата меньше заданного числа или даты
// псевдонимы: lt, lessThan

expect(1).to.equal(1);                          // Recommended
expect(1).to.be.below(2);                       // Not recommended

expect('foo').to.have.lengthOf(3);              // Recommended
expect('foo').to.have.lengthOf.below(4);        // Not recommended

expect([1, 2, 3]).to.have.length(3);            // Recommended
expect([1, 2, 3]).to.have.lengthOf.below(4);    // Not recommended

// --------------- most 

// утверждает, что целью является число или дата, меньшие или равные заданному числу или дате
// псевдонимы: lte, lessThanOrEqual

expect(1).to.equal(1);                          // Recommended
expect(1).to.be.at.most(2);                     // Not recommended
expect(1).to.be.at.most(1);                     // Not recommended

expect('foo').to.have.lengthOf(3);              // Recommended
expect('foo').to.have.lengthOf.at.most(4);      // Not recommended

expect([1, 2, 3]).to.have.lengthOf(3);          // Recommended
expect([1, 2, 3]).to.have.lengthOf.at.most(4);  // Not recommended

// --------------- within 

// утверждает, что целью является число или дата, находящиеся в заданном диапозоне, включая крайние значения

expect(2).to.equal(2);                              // Recommended
expect(2).to.be.within(1, 3);                       // Not recommended
expect(2).to.be.within(2, 3);                       // Not recommended
expect(2).to.be.within(1, 2);                       // Not recommended

expect('foo').to.have.lengthOf(3);                  // Recommended
expect('foo').to.have.lengthOf.within(2, 4);        // Not recommended

expect([1, 2, 3]).to.have.lengthOf(3);              // Recommended
expect([1, 2, 3]).to.have.lengthOf.within(2, 4);    // Not recommended

// --------------- instanceof 

// утверждает, что цель является экземпляром данного constructor
// из-за ограничений в ES5 может не всегда работать должным образом при использовании транспилятора, такого как Babel или TypeScript

function Cat() { }
expect(new Cat()).to.be.an.instanceof(Cat);
expect([1, 2]).to.be.an.instanceof(Array);

// --------------- property 

// утверждает, что у цели есть свойство с указанным ключом 
// deep / own / nested
// псевдонимы: ownProperty и haveOwnProperty вместо .own.property

expect({ a: 1 }).to.have.property('a');
expect({ a: 1 }).to.have.property('a', 1);          // с учетом значения

// изменяет цель любых утверждений, следующих в цепочке, на значение свойства исходного целевого объекта
expect({ a: 1 })
    .to.have.property('a')      // цель: объект { a: 1 }
    .that.is.a('number');       // цель: свойство a

// --------------- ownPropertyDescriptor 

// утверждает, что цель имеет собственный дескриптор свойства с указанным ключом
// псевдоним: haveOwnPropertyDescriptor

expect({ a: 1 }).to.have.ownPropertyDescriptor('a');

// сравнивает дескриптор цели с заданным
expect({ a: 1 }).to.have.ownPropertyDescriptor('a',
    {
        configurable: true,
        enumerable: true,
        writable: true,
        value: 1,
    });

// изменяет цель на значение дескриптора свойства 
expect({ a: 1 })
    .to.have.ownPropertyDescriptor('a')
    .that.has.property('enumerable', true);

// --------------- lengthOf 

// утверждает, что цель length или size равна заданному числу n
// псевдонимы: рекомендуется всегда использовать lengthOf 

expect([1, 2, 3]).to.have.lengthOf(3);                                  // длина массива
expect('foo').to.have.lengthOf(3);                                      // длина строки
expect(new Set([1, 2, 3])).to.have.lengthOf(3);                         // размер Set
expect(new Map([['a', 1], ['b', 2], ['c', 3]])).to.have.lengthOf(3);    // размер Map

// может использоваться в цепочки для смены цели на размерность объекта
expect([1, 2, 3]).to.have.lengthOf.above(2);        // Not recommended: above, below, least, most, within

// --------------- match

// утверждает, что цель соответствует заданному регулярному выражению 
// псевдоним: matches

expect('foobar').to.match(/^foo/);

// --------------- string 

// утверждает, что целевая строка содержит данную подстроку
expect('foobar').to.have.string('bar');

// --------------- keys 

// утверждает, что целевой объект, массив, map или set имеют заданные ключи
// deep / any / all / include
// значения могут задаваться как аргументы, массивом, объектом
// all рекомендуется указывать явно перед keys
// псевдонимы: key

// если целью является массив или объект:
expect({ a: 1, b: 2 }).to.have.all.keys('a', 'b');
expect(['x', 'y']).to.have.all.keys(0, 1);

expect({ a: 1, b: 2 }).to.have.all.keys(['a', 'b']);
expect(['x', 'y']).to.have.all.keys([0, 1]);

expect({ a: 1, b: 2 }).to.have.all.keys({ a: 4, b: 5 });    // значения игнорируются
expect(['x', 'y']).to.have.all.keys({ 0: 4, 1: 5 });        // значения игнорируются

// если целью является set или map:
expect(new Map([['a', 1], ['b', 2]])).to.have.all.keys('a', 'b');
expect(new Set(['a', 'b'])).to.have.all.keys('a', 'b');

// any/all

expect({ a: 1, b: 2 }).to.have.all.keys('a', 'b');          // Recommended;         цель содержит все указанные ключи
expect({ a: 1, b: 2 }).to.have.any.keys('a', 'b');          // Not recommended;     цель срдержит хотя бы один указанный ключ

// any/all с отрицанием
expect({ a: 1, b: 2 }).to.not.have.any.keys('c', 'd');      // Recommended;         ошибка возникнет если цель имеет хотя бы один указанный ключ
expect({ a: 1, b: 2 }).to.not.have.all.keys('c', 'd');      // Not recommended;     ошибка возникнет если цель содержит все указанные ключи
expect({ a: 1, b: 2 }).to.not.have.all.keys('a');
expect({ a: 1, b: 2 }).to.not.have.all.keys('a', 'b');      // ошибка возникает только в этом случае
expect({ a: 1, b: 2 }).to.not.have.all.keys('a', 'b', 'c');

// --------------- throw

// вызывает целевую функцию и утверждает, что возникла ошибка
// из-за ограничений в ES5 может не всегда работать должным образом при использовании транспилятора, такого как Babel или TypeScript
// псевданимы: throws, Throw

var err = new TypeError('Illegal salmon!');
err.code = 42;
var badFn = function () { throw err; };
var goodFn = function () { };

expect(badFn).to.throw();               // возникла ошибка
expect(badFn).to.throw(TypeError);      // возникла ошибка, являющаяся экземпляром конструктора TypeError
expect(badFn).to.throw(err);            // возникла ошибка, экземпляр которой строго (===) равен указанному
expect(badFn).to.throw('salmon');       // возникла ошибка, свойство message равно указанной строке
expect(badFn).to.throw(/salmon/);       // возникла ошибка, свойство message удовлетворяет регулярному выражению

expect(badFn).to.throw(TypeError, 'salmon');
expect(badFn).to.throw(TypeError, /salmon/);
expect(badFn).to.throw(err, 'salmon');
expect(badFn).to.throw(err, /salmon/);

expect(goodFn).to.not.throw();                      // Recommended
expect(goodFn).to.not.throw(ReferenceError, 'x');   // Not recommended

expect(badFn).to.throw(TypeError, 'salmon');        // Recommended
expect(badFn).to.not.throw(ReferenceError, 'x');    // Not recommended

// изменяет цель на выдаваемый объект ошибки
expect(badFn)
    .to.throw(TypeError)
    .with.property('code', 42);

// если в функцию fn нужно передавать данные, перенесите вызов fn внутрь другой функции

expect(function () { fn(42); }).to.throw();         // Function expression
expect(() => fn(42)).to.throw();                    // ES6 arrow function

// this контекст будет потерян, при передаче this в утверждение, когда функция будет вызвана
let cat = { meow: () => { } };
expect(function () { cat.meow(); }).to.throw();     // Function expression
expect(() => cat.meow()).to.throw();                // ES6 arrow function
expect(cat.meow.bind(cat)).to.throw();              // Bind

// --------------- respondTo

function Cat() { }
Cat.prototype.meow = function () { };
Cat.hiss = function () { };

// если цель non-function объект: утверждает, что у цели есть метод с заданным именем
expect(new Cat()).to.respondTo('meow');
expect(new Cat()).to.be.an('object').that.respondsTo('meow');

// если цель function объект: утверждает, что у свойства prototype цели есть метод с заданным именем
expect(Cat).to.respondTo('meow');

// --------------- itself

// добавьте itself, чтобы заставить рассматривать цель как non-function объект, даже если это функция
// т.е. цель имеет метод с указанным именем а не свойство prototype цели
expect(Cat)
    .itself.to.respondTo('hiss')
    .but.not.respondTo('meow');

// --------------- satisfy

// вызывает заданную функцию, передает в нее целевой объект и ожидает что функция вернет true
// псевдонимы: satisfies

expect(1).to.satisfy(function (num) {
    return num > 0;
});

// --------------- closeTo 

// утверждает, что целью является число, находящееся в заданном диапазоне +/- delta
// псевдонимы: approximately

expect(1.5).to.equal(1.5);              // Recommended
expect(1.5).to.be.closeTo(1, 0.5);      // Not recommended

// --------------- members

// утверждает, что целевой массив имеет те же элементы, что и указанный в утверждении
// deep / ordered / include

expect([1, 2, 3]).to.have.members([2, 1, 3]);                       // массив содержит элементы из указанного массива
expect([1, 2, 2]).to.have.members([2, 1, 2]);                       // с учетом повторений

expect([1, 2, 3]).to.have.ordered.members([1, 2, 3]);               // с учетом порядка следования
expect([1, 2, 3])
    .to.have.members([2, 1, 3])
    .but.not.ordered.members([2, 1, 3]);

expect([1, 2, 3]).to.include.members([1, 2]);                       // подмножество
expect([1, 2, 3]).to.include.members([1, 2, 2, 2]);

expect([{ a: 1 }, { b: 2 }, { c: 3 }])
    .to.include.deep.ordered.members([{ a: 1 }, { b: 2 }])          // все вместе
    .but.not.include.deep.ordered.members([{ b: 2 }, { c: 3 }]);

expect([1, 2]).to.not.include(3).and.not.include(4);                // Recommended
expect([1, 2]).to.not.have.members([3, 4]);                         // Not recommended

// --------------- oneOf 

// утверждает, что цель является членом указанного массива 
// сравнение выполняется с использованием строгого (===) равенства

expect(1).to.equal(1);              // Recommended
expect(1).to.be.oneOf([1, 2, 3]);   // Not recommended

// использовать с contain и include, работает с массивами и строками
expect('Today is sunny').to.contain.oneOf(['sunny', 'cloudy'])
expect('Today is rainy').to.not.contain.oneOf(['sunny', 'cloudy'])
expect([1, 2, 3]).to.contain.oneOf([3, 4, 5])
expect([1, 2, 3]).to.not.contain.oneOf([4, 5, 6])

// --------------- change

// утверждает что состояние указанного объекта изменяется до и после вызова целевой функции
// используется строгое (===) равенство
// псевдонимы: changes

// утверждает что указанная функция возвращает разные значения до и после вызова целевой функции
var dots = '', addDot = function () { dots += '.'; }, getDots = function () { return dots; };
// Recommended
expect(getDots()).to.equal('');
addDot();
expect(getDots()).to.equal('.');
// Not recommended
expect(addDot).to.change(getDots);

// утверждает что указанное свойство объекта изменится после вызова целевой функции
var myObj = { dots: '' }, addDot = function () { myObj.dots += '.'; };
// Recommended
expect(myObj).to.have.property('dots', '');
addDot();
expect(myObj).to.have.property('dots', '.');
// Not recommended
expect(addDot).to.change(myObj, 'dots');

// утверждает на сколько изменяется объект
var myObj = { val: 1 }, addTwo = function () { myObj.val += 2; }, subtractTwo = function () { myObj.val -= 2; };
expect(addTwo).to.increase(myObj, 'val').by(2);         // Recommended
expect(addTwo).to.change(myObj, 'val').by(2);           // Not recommended
expect(subtractTwo).to.decrease(myObj, 'val').by(2);    // Recommended
expect(subtractTwo).to.change(myObj, 'val').by(2);      // Not recommended

// --------------- increase 

// псевдонимы: increases

// утверждает что указанная функция возвращает большее значения после вызова целевой функции
var val = 1, addTwo = function () { val += 2; }, getVal = function () { return val; };
expect(addTwo).to.increase(getVal).by(2);               // Recommended
expect(addTwo).to.increase(getVal);                     // Not recommended

// утверждает что указанное свойство объекта принмает большее значение после вызова целевой функции
var myObj = { val: 1 }, addTwo = function () { myObj.val += 2; };
expect(addTwo).to.increase(myObj, 'val').by(2);         // Recommended
expect(addTwo).to.increase(myObj, 'val');               // Not recommended

// --------------- decrease 

// псевдонимы: decreases

// утверждает что указанная функция возвращает меньшее значения после вызова целевой функции
var val = 1, subtractTwo = function () { val -= 2; }, getVal = function () { return val; };
expect(subtractTwo).to.decrease(getVal).by(2);          // Recommended
expect(subtractTwo).to.decrease(getVal);                // Not recommended

// утверждает что указанное свойство объекта принимает меньшее значение после вызова целевой функции
var myObj = { val: 1 }, subtractTwo = function () { myObj.val -= 2; };
expect(subtractTwo).to.decrease(myObj, 'val').by(2);    // Recommended
expect(subtractTwo).to.decrease(myObj, 'val');          // Not recommended

var myObj = { val: 1 }, addTwo = function () { myObj.val += 2; };
expect(addTwo).to.increase(myObj, 'val').by(2);         // Recommended
expect(addTwo).to.not.decrease(myObj, 'val');           // Not recommended

var myObj = { val: 1 }, noop = function () { };
expect(noop).to.not.change(myObj, 'val');               // Recommended
expect(noop).to.not.decrease(myObj, 'val');             // Not recommended

// --------------- by 

// используется совместно с increase и decrease, утверждает что после выполнения целевой функции указанный объект изменился на указанное значение

var myObj = { val: 1 }, addTwo = function () { myObj.val += 2; }, subtractTwo = function () { myObj.val -= 2; };

expect(addTwo).to.increase(myObj, 'val').by(2);
expect(subtractTwo).to.decrease(myObj, 'val').by(2);

expect(addTwo).to.increase(myObj, 'val').by(2);         // Recommended
expect(addTwo).to.change(myObj, 'val').by(2);           // Not recommended

expect(subtractTwo).to.decrease(myObj, 'val').by(2);    // Recommended
expect(subtractTwo).to.change(myObj, 'val').by(2);      // Not recommended

expect(addTwo).to.increase(myObj, 'val').by(2);         // Recommended
expect(addTwo).to.increase(myObj, 'val').but.not.by(3); // Not recommended

// --------------- extensible

// утверждает, что цель является расширяемой, что означает, что к ней могут быть добавлены новые свойства

expect({ a: 1 }).to.be.extensible;
expect(1).to.not.be.extensible;

var nonExtensibleObject = Object.preventExtensions({});
expect(nonExtensibleObject).to.not.be.extensible;

var sealedObject = Object.seal({});
expect(sealedObject).to.not.be.extensible;

var frozenObject = Object.freeze({});
expect(frozenObject).to.not.be.extensible;

// --------------- sealed

// утверждает, что цель sealed, т.е. к ней нельзя добавлять новые свойства, а существующие не могут быть перенастроены или удалены
// однако, существующим свойствам можно присвоить другие значения

var sealedObject = Object.seal({});
var frozenObject = Object.freeze({});

expect(sealedObject).to.be.sealed;
expect(frozenObject).to.be.sealed;
expect(1).to.be.sealed;

// --------------- frozen

// утверждает, что цель frozen, т.е. к ней нельзя добавлять новые свойства, а существующие не могут быть перенастроены или удалены
// существующим свойствам нельзя присвоить другие значения
// примитивы всегда заморожены

var frozenObject = Object.freeze({});
expect(frozenObject).to.be.frozen;
expect(1).to.be.frozen;

// --------------- finite

// утверждает, что целью является число, а не NaN, +Infinity, -Infinity

expect('foo').to.be.a('string');        // Recommended
expect('foo').to.not.be.finite;         // Not recommended

expect(NaN).to.be.NaN;                  // Recommended
expect(NaN).to.not.be.finite;           // Not recommended

expect(Infinity).to.equal(Infinity);    // Recommended
expect(Infinity).to.not.be.finite;      // Not recommended

expect(-Infinity).to.equal(-Infinity);  // Recommended
expect(-Infinity).to.not.be.finite;     // Not recommended

// --------------- fail 

// вызвать ошибку
expect.fail();
expect.fail("custom error message");
expect.fail(1, 2);
expect.fail(1, 2, "custom error message");
expect.fail(1, 2, "custom error message", ">");
expect.fail(1, 2, undefined, ">");
