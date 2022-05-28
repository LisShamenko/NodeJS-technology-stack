import "./style.css";
console.log("--- Style css!");

import "./style.scss";
console.log("--- Style scss!");

// транспиляция ES5
const fancyFunc = () => {
    return [1, 2];
};
const [a, b] = fancyFunc();

// загрузка модуля ES, статический импорт
import { getUsers } from "./common/usersAPI_static";
getUsers().then(json => console.log(json));

// Вся библиотека moment собрана в основной точке входа приложения.
import moment from "moment";
moment().format();

// --- 1.5 Code splitting: динамический импорт.

// Более мощный метод разделения кода использует динамический импорт для условной 
//      загрузки кода. Разделение кода может быть выполнено на уровне модуля или
//      на уровне маршрута. Модули JavaScript могут загружаться в ответ на действия
//      пользователя или в ответ на изменения маршрута.

// Загрузка пользователей после нажатия кнопки. Модули ES являются статическими, 
//      поэтому нельзя изменить импорт во время выполнения.
const btn_static = document.getElementById("btn_static");
btn_static.addEventListener("click", () => {
    getUsers().then(json => console.log(json));
});

// С помощью динамического импорта можно выбирать, когда следует загружать код.
//      Создается функцию для динамической загрузки модуля.
const getUserModule = () => {
    // добавляя префикс к пути импорта, можно управлять именем чанка
    return import(/* webpackChunkName: "usersAPI" */ "./common/usersAPI_dynamic");
}

// модуль "./common/usersAPI_dynamic" будет загружаться при нажатии на кнопку
const btn_dynamic = document.getElementById("btn_dynamic");
btn_dynamic.addEventListener("click", () => {
    // вызов функции then позволяет использовать динамический импорт
    getUserModule().then(({ getPosts }) => {
        getPosts().then(json => console.log(json));
    });
});