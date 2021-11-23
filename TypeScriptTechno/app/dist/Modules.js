"use strict";
// refactoring - https://www.typescriptlang.org/docs/handbook/declaration-merging.html
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// --------------- Модуляризация
// принято два разных подхода к загрузке модулей, оба поддерживаются TypeScript:
// - CommonJS (используется в Node) 
// - AMD (асинхронное определение модуля, используется в Require)
// модуль представляет собой отдельный файл TypeScript из которого выполняется экспортгруппы.
// для включения файлов JavaScript в HTML-страницу доступно два варианта: 
// - процесс связывания - дополнительный шаг после компиляции, чтобы скопировать(или связать)
//      все исходные файлы в один, что потребует включать только одну ссылку в HTML-страницу и
//      загружать весь файл за один раз, это может повлиять на общее время загрузки страницы
// - загрузчик модулей - позволяют браузеру загружать все файлы одновременно в отдельных потоках,
//      что сокращает время загрузки страницы, при этом каждый файл сам определяет свои зависимости
// --------------- Импорт модулей
// ключевое слово import используется для импорта модулей
const Module1_1 = require("./Modules/Module1");
let mod1 = new Module1_1.Module1();
mod1.print();
// переименование модулей
const Module1_2 = require("./Modules/Module1");
let m1mod1 = new Module1_2.Module1();
m1mod1.print();
// использовать второе имя модуля
const Module1_3 = require("./Modules/Module1");
let nm = new Module1_3.NewModule1();
nm.print();
// экспорт переменных
const Module1_4 = require("./Modules/Module1");
console.log(Module1_4.myVariable);
// более простой синтаксис экспорта по умолчанию
const Module2_1 = __importDefault(require("./Modules/Module2"));
let m2default = new Module2_1.default();
m2default.print();
// ключевое слово import делает две вещи: 
// - импортирует файл объявлений для модуля, что дает доступ к сигнатурам типов
// - во время выполнения загружает файл JavaScript для использования
// при попытке написать код без модулей теряется способность среды разработки использовать 
// файлы объявлений, но можно импортировать типы, используя так называемые типы импорта
function printWithoutModule(mod3) {
    mod3.print();
}
// можем использовать ключевое слово import для импорта файла объявлений этого класса
// импорта файла Module3.d.ts и корректное приведение типа mod3 к определению Module3
function printWithModule(mod3) {
    mod3.add(1).add(2).add(3);
    mod3.print();
    mod3.remove().remove();
    mod3.print();
}
const Module3_1 = require("./Modules/Module3");
printWithModule(new Module3_1.Module3());
//# sourceMappingURL=Modules.js.map