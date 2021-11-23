// --------------- Экспорт модулей

// ключевое слово export делает Module1 доступным в других файлах
export class Module1 {
    print() {
        print(`Module1.print()`);
    }
}

function print(functionName: string) {
    console.log(`print() called with ${functionName}`);
}

// может быть несколько имен для экспортируемого модуля
export { Module1 as NewModule1 };

// экспорт переменных
let myVariable = "This is a variable.";
export { myVariable }