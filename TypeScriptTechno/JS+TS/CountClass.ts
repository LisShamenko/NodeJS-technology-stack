// --------------- приватные переменные (стр. 35)

// JavaScript
// - нет способа объявления закрытых переменных, но можно эмулировать с помощью замыканий
// - принято использовать символ подчеркивания 
// - приватной переменной можно присвоить значение, что не вызовет ошибку
var MyClass = (function () {
    function MyClass() {
        this._count = 0;
    }
    MyClass.prototype.countUp = function () {
        this._count++;
    }
    MyClass.prototype.getCountUp = function () {
        return this._count;
    }
    return MyClass;
}());

// TypeScript
// - попытка доступа к приватной переменной приведет к ошибке времени компиляции
export class CountClass {
    private _count: number;
    constructor() {
        this._count = 0;
    }
    countUp() {
        this._count++;
    }
    getCount() {
        return this._count;
    }
}

