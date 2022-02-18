import Star from './components/Star';
import React from 'react';
import ReactDOM from "react-dom";

test("renders a star", () => {

    // создать элемент div для отображения компонента
    const div = document.createElement("div");
    ReactDOM.render(<Star />, div);

    // проверяем, что внутри div существует элемент svg
    expect(div.querySelector("svg")).toBeTruthy();
});