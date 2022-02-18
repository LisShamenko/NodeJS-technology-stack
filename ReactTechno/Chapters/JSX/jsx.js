// --------------- 2. JSX.

// JSX - это расширение JavaScript, которое позволяет определять элементы React 
//      с использованием синтаксиса тегов в коде JavaScript. JSX позволяет 
//      обойтись без вызовов метода createElement. 

// В JSX тип элемента указывается с помощью тега, атрибуты тега задают свойства, 
//      а дочерние элементы добавляются между тегами элемента. JSX работает 
//      с компонентами React.

// Свойства компонента могут быть строкой или выражением в фигурных скобках, 
//      которое может включать массивы, объекты и функции:
//
//      React.createElement(IngredientsList, { list:[...] });
//                                 ↓            ↓
//                            <IngredientsList list={[...]}/>

// JSX позволяет добавлять компоненты как дочерние по отношению к другим компонентам.
//
//      <IngredientsList>
//          <Ingredient />
//          <Ingredient />
//          <Ingredient />
//      </IngredientsList>

// Для определения атрибута 'class' используется 'className', поскольку слово 'class'
//      зарезервировано в JavaScript.
//
//      <h1 className="fancy">Baked Salmon</h1>

// Выражения JavaScript заключаются в фигурные скобки и определяют, как будут
//      использоваться результаты вычислений, любой код в фигурных скобках будет
//      вычислен. 
// 
//      <h1>{title}</h1>
//      <h1>{"Hello" + title}</h1>
//      <h1>{title.toLowerCase().replace}</h1>
//      <input type="checkbox" defaultChecked={false} />

// JSX можно включать в функции JavaScript, чтобы управлять созданием разметки JSX.
//
//      <ul>
//          {
//              // массив преобазуется в список элементов li
//              props.ingredients.map(
//                  (ingredient, i) => (<li key="{i}">{ingredient}</li>)
//              )
//          }
//      </ul>

// --- 2.1 Фрагменты React.

import React from "react";
import { render } from "react-dom";

// Фрагменты - это функция React, которая устраняет необходимость в дополнительных
//      тегах-оболочках, засоряющих DOM.

// рендеринга компонентов с использованием фрагмента React
function Cat({ name }) {

    // смежные элементы JSX должны быть заключены в тег или произойдет ошибка
    //      return (
    //          <h1>...</h1>
    //          <p>...</p>
    //      );

    // решение: 
    // - добавить родительский тег, но это засоряет разметку
    // - перечислить элементы через запятую
    // - использовать фрагмент React

    return (
        // фрагмент <Fragment>...</Fragment> можно сократить до записи: <>...</>
        <React.Fragment>
            <h1>Кошку зовут: {name}.</h1>
            <p>Она хороша.</p>
        </React.Fragment>
    );

}

// 
render(<Cat name="кошка" />, document.getElementById("main-cat"));

// --- 2.2 Babel.

// Babel
//      https://babeljs.io/

// React Developer Tools - расширение для браузера.

// Транспиляция - это процесс преобразования кода JSX в код JavaScript, который
//      может быть интерпритирован браузером.

// Если включить ссылку на CDN Babel в код HTML, то Babel будет транспилировать
//      любой код в блоках script с типом 'text/babel' перед его запуском. 

// --- 2.3 Приложение JSX.

// Функциональный подход заключается в разбиении кода на более сфокусированные 
//      функциональные компоненты и сборка их вместе. 

// Папка проекта:
//      mkdir recipes-app
//      cd recipes-app

// Инициализация проекта и установка пакетов webpack, webpack-cli, react, react-dom:
//      npm init -y
//      npm install React-dom serve

// Возможная структура попок проекта recipes, исключая стандартные файлы:
// 
//      > ./recipes-app
//          > index.html
//          > ./source
//              > index.js
//              > ./data
//                  > recipes.json
//              > ./components
//                  > Recipe.js
//                  > InstructionsList.js
//                  > IngredientsList.js

import index from "./recipes-source/index";