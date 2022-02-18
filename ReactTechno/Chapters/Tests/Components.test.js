// Статья Мартина Фаулера 'Unit Testing'
//      https://martinfowler.com/bliki/UnitTest.html

// Статья Мартина Фаулера 'Test-Coverage'
//      https://martinfowler.com/bliki/TestCoverage.html

// 'Red, Green, Refactor'
//      https://www.codecademy.com/article/tdd-red-green-refactor



import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent } from "@testing-library/react";

// расширение функциональности expext
import "@testing-library/jest-dom/extend-expect";
//import { toHaveAttribute } from "@testing-library/jest-dom";
//expect.extend({ toHaveAttribute });

// 
import Star from './components/Star';
import Checkbox from './components/Checkbox';



// --------------- 10. Тестирование.

// Компонент React - это инструкции, которые React использует для создания DOM.
//      У NodeJS нет DOM API, как в браузере. Jest включает пакет jsdom 
//      для моделирования среды браузера.
//      https://github.com/testing-library/jest-dom#custom-matchers

// 
describe('component PostForm', () => {

    // --- 10.1 React Testing Library.

    // React Testing Library - это проект по внедрению передовых методов тестирования.

    // 
    test("test attribute id", () => {

        // 
        const div = document.createElement("div");
        ReactDOM.render(<Star />, div);

        // 
        expect(div.querySelector("svg")).toHaveAttribute("id", "star");
    });

    // --- 10.2 Запросы.

    // Запросы - это функция тестирования React, которая позволяет выполнять поиск 
    //      по определенным критериям.

    // 
    test("test text", () => {

        // функция render является частью библиотеки тестирования React, 
        //      в качестве аргумента принимает компонент или элемент, 
        //      возвращает объект запросов для проверки значений
        const { getByText } = render(<Star />);

        // - getByText находит элемент h1 при помощи регулярного выражения
        // - getAllBy позволяет вернуть список всех совпадающих узлов
        const h1 = getByText(/Star/);

        // проверка, содержит ли h1 правильный текст
        expect(h1).toHaveTextContent("Star");
    });

    // --- 10.3 Тестирование событий.

    // 
    test("test click on label", () => {

        // у входных данных есть метка
        const { getByLabelText } = render(<Checkbox />);

        // когда компонент отображается первый раз, текстовая метка будет содержать 
        //      строку 'not checked' по которой можно ее найти:
        const checkbox = getByLabelText(/not checked/i);

        // генерация события и проверка значения checked
        fireEvent.click(checkbox);
        expect(checkbox.checked).toEqual(true);
        fireEvent.click(checkbox);
        expect(checkbox.checked).toEqual(false);
    });

    // 
    test("find by test id", () => {

        // Функция getByTestId полезна при поиске труднодоступных элементов DOM:
        //      https://testing-library.com/docs/queries/bytestid/

        //
        const { getByTestId } = render(<Checkbox />);
        const checkbox = getByTestId("checkbox");

        // 
        fireEvent.click(checkbox);
        expect(checkbox.checked).toEqual(true);
    });

});