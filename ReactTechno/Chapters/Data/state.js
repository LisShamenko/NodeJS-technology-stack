// react-icons - библиотека SVG-иконок для React. 
//      https://react-icons.github.io/react-icons/
//      npm i react-icons

import React, { useState, useRef, createContext, useContext } from "react";
import { FaStar } from "react-icons/fa";
import { render } from "react-dom";

// --------------- 3. Управление состоянием.

// Дерево компонентов - это иерархия компонентов, в которой данные проходят
//      по компонентам в виде свойств и инкапсулируются в компонентах в виде
//      состояний. Компоненты соединяются друг с другом за счет передачи свойств.
//      Изменение состояния компонента приводит к изменению свойств дочерних 
//      компонентов. Новые данные проходят через дерево, вызывая рендеринг 
//      определенных листьев и ветвей.

// --- 3.1 Общие компоненты.

// функция создания массива
const createArray = length => [...Array(length)];

// Свойство onSelect является функцией, которая будет вызываться при срабатывании 
//      onClick. Значение по умолчанию 'f => f' является функцией-пустышкой, которая 
//      ничего не делает и возвращет любой аргумент обратно. Благодаря функции 
//      по умолчанию не происходит ошибка, когда аргумент onSelect не определен.
const Star = ({ selected = false, onSelect = f => f }) => (
    // отображает отдельную звезду и использует свойство selected 
    //      для ее заливки соответствующим цветом
    <FaStar color={selected ? "red" : "grey"} onClick={onSelect} />
);

// --- 3.2 Хук useState.

// Хук useState - это встроенный хук, который позволяет добавлять состояние 
//      к компоненту React. Хуки содержат повторно используемый код, отделенный 
//      от дерева компонентов и позволяют добавлять компонентам функциональность.

// Инструменты разработчика React позволяют увидеть, какие хуки включены 
//      в определенные компоненты.

// Вызов функции-хука useState подключает компонент к состоянию и возвращает 
//      массив, первое значение которого является переменной состояния. 
//      Деструктуризация массива позволяет давать любое название переменной 
//      состояния. Значение, передаваемое в useState, является значением 
//      по умолчанию для переменной состояния. 

// - totalStars указывает на длину массива, который мы хотим создать
// - при изменении данных, хук может повторно отобразить связанный компонент 
//      с новыми данными
function StarRating({ totalStars = 5 }) {

    // Второй элемент массива useState является функцией, которая позволяет 
    //      изменять состояние. Деструктуризация массива позволяет дать любое 
    //      название этой функции.

    // Важно помнить, что хуки могут вызывать повторную визуализацию компонента, 
    //      к которому они подключены. При вызове set-функции хука компонент будет 
    //      отрисован повторно с новым значением.

    // переменная состояния selectedStars будет хранить оценку пользователя
    const [selectedStars, setSelectedStars] = useState(0);

    // 
    return (
        <React.Fragment>
            {createArray(totalStars).map((n, i) => (
                <Star
                    key={i}
                    selected={selectedStars > i}
                    onSelect={() => setSelectedStars(i + 1)}
                />
            ))}
            <p>{selectedStars} of {totalStars} stars</p>
        </React.Fragment>
    );
}

// --- 3.3 Состояние до React 16.8.

// До React 16.8 состояние добавлялось к компоненту при помощи класса React.Component,
//      что требовало дополнительного кода и усложняли повторное использование функций
//      в компонентах.

// устаревшая версия компонента
class StarRating_Old extends React.Component {
    constructor(props) {
        super(props);

        // 
        this.state = {
            starsSelected: 0
        };

        // требуется привязка методов
        this.change = this.change.bind(this);
    }

    // 
    change(starsSelected) {
        // требуется ключевое слово this
        this.setState({ starsSelected });
    }

    // 
    render() {
        const { totalStars } = this.props;
        const { starsSelected } = this.state;
        return (
            <div>
                {[...Array(totalStars)].map((n, i) => (
                    <Star
                        key={i}
                        selected={i < starsSelected}
                        onSelect={() => this.change(i + 1)}
                    />
                ))}
                <p>{starsSelected} of {totalStars} stars</p>
            </div>
        );
    }
}

// --- 3.4 Рефакторинг для улучшения повторного использования

// стили нужно передать элементу div, играющего роль контейнера вместо фрагмента,
//      оператор spread позволяет собрать все свойства передаваемые элементу
//      StarRating_Style и направить их в элемент div
function StarRating_Style({ style = {}, totalStars = 5, ...props }) {

    // 
    const [selectedStars, setSelectedStars] = useState(0);

    // 
    return (
        // по умолчанию div имеет отступ в 5px, оператор spread позволяет применить
        //      остальные свойства объекта style к стилю
        <div style={{ padding: "5px", ...style }} {...props}>
            {createArray(totalStars).map((n, i) => (
                <Star
                    key={i}
                    selected={selectedStars > i}
                    onSelect={() => setSelectedStars(i + 1)}
                />
            ))}
            <p>
                {selectedStars} of {totalStars} stars
            </p>
        </div>
    );
}

// свойство style, которое позволяет добавлять к элементам стили CSS
function App() {
    return (
        <div>
            <h1>Компонент звёздной оценки.</h1>
            <StarRating />
            <hr />
            <h1>Старый синтаксис.</h1>
            <StarRating_Old totalStars={45} />
            <hr />
            <h1>Передача синтаксиса.</h1>
            <StarRating_Style
                style={{ backgroundColor: "lightblue" }}
                onDoubleClick={e => alert("double click")}
            />
            <hr />
        </div>
    );
}

// --- 3.5 Запуск.

render(<App />, document.getElementById("root-stars"));