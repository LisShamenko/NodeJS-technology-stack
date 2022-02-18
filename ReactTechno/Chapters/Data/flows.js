// React Icons - иконки React
//      https://react-icons.github.io/react-icons/

import React, { useState } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { render } from "react-dom";

import colorData from "./../../data/colorData";

// --------------- 3. Двунаправленный поток данных.

// 
const createArray = length => [...Array(length)];

// --- 3.1 Передача данных вниз по дереву компонентов.

// Один из подходов управления состоянием: сохранить состояние в корне дерева 
//      компонентов и передать его дочерним компонентам через свойства.

// 
render(<App_Down />, document.getElementById("root-flow-down"));

// корневой компонент
function App_Down() {

    // только корневой компонент обращается к хуку useState, чтобы получить состояние
    const [colors] = useState(colorData.colors);

    // массив цветов используется, как начальное состояние для свойства colors
    return (
        <div>
            <h1>Передача данных вниз по дереву компонентов.</h1>
            <ColorList_Down colors={colors} />
        </div>
    );
}

// компонент отображающий список цветов
function ColorList_Down({ colors = [] }) {
    if (!colors.length) {
        return <div>No Colors.</div>;
    }

    // 
    return (
        <div>
            {
                // данные о каждом цвете передаются дальше по дереву в компонент Color
                colors.map(color => (
                    <Color_Down key={color.id} {...color} />
                ))
            }
        </div>
    );
}

// компонент для описания отдельного цвета
function Color_Down({ title, color, rating }) {
    // компонент получает три свойства: title, color, rating
    return (
        <section>
            <h1>{title}</h1>
            <div style={{ height: 50, backgroundColor: color }} />
            {
                // свойство rating передается дальше по дереву компонентов
                <StarRating_Down selectedStars={rating} />
            }
        </section>
    );
}

// компонент рейтинга
function StarRating_Down({ totalStars = 5, selectedStars = 0 }) {
    // чистый компонент - это функциональный компонент, который не содержит 
    //      состояния и создает одну и ту же разметку при одинаковых входных 
    //      свойствах
    return (
        <>
            {createArray(totalStars).map((n, i) => (
                <Star_Down key={i} selected={selectedStars > i} />
            ))}
            <p>{selectedStars} of {totalStars} stars</p>
        </>
    );
}

// конечный получатель состояния в цепочке 
function Star_Down({ selected = false }) {
    return (<FaStar color={selected ? "red" : "grey"} />);
}

// --- 3.2 Передача обработчиков вверх по дереву компонентов.

// Состояние хранится в корневом компоненте, поэтому чтобы изменить состояние 
//      следует собрать все взаимодействия от дочерних компонентов и передать 
//      их обратно в корневой компонент.

// Таким образом:
//      - данные передаются вниз по дереву компонентов через свойства;
//      - взаимодействия передаются вверх по дереву вместе с данными 
//        через свойства функции.

// первый компонент генерирующий событие и передающий его вверх по цепочке
function Star_Up({ selected = false, onSelect = f => f }) {
    return (
        <FaStar
            color={selected ? "red" : "grey"}
            onClick={onSelect}
        />
    );
}

// 
function StarRating_Up({ totalStars = 5, selectedStars = 0, onRate = f => f }) {
    return (
        <>
            {createArray(totalStars).map((n, i) => (
                <Star_Up key={i} selected={selectedStars > i}
                    // событие onSelect вызывает функцию оценки, которая передается
                    //      через свойство по цепочке от самого корня
                    onSelect={() => onRate(i + 1)}
                />
            ))}
        </>
    );
}

// компонент Color перехватывает событие onClick и передает вызов вверх 
//      по дереву компонентов
function Color_Up({ id, title, color, rating, onRemove = f => f, onRate = f => f }) {
    return (
        <section>
            <h1>{title}</h1>
            {
                // кнопка удаления цвета, обработчик onClick вызывает функцию onRemove, 
                //      которая передается в компонент через свойство, то есть компонент
                //      уведомляет родителя о выполнении действия, но сам ничего не делает,
                //      данный механизм позволяет сохранить чистоту компонента

                // при нажатии на кнопку вызывается функция onRemove, которой передается 
                //      идентификатор цвета
                <button onClick={() => onRemove(id)}>
                    <FaTrash />
                </button>
            }
            <div style={{ height: 50, backgroundColor: color }} />
            <StarRating_Up selectedStars={rating}
                // значение rating из обработчика компонента StarRating передается
                //      с идентификатором наверх в родительскую функцию-обработчик
                onRate={rating => onRate(id, rating)}
            />
        </section>
    );
}

// компонент ColorList передает сигнал дальше в корневой компонет
function ColorList_Up({ colors = [], onRemoveColor = f => f, onRateColor = f => f }) {
    if (!colors.length) {
        return <div>No Colors.</div>;
    }

    // 
    return (
        <div className="color-list">
            {
                colors.map(color => (
                    <Color_Up key={color.id} {...color}
                        // вызывает onRemoveColor и передает ответственность за удаление 
                        //      своему родителю, идентификатор передается дальше в onRemoveColor
                        onRemove={onRemoveColor}
                        // так же передает событие onRate родительскому компоненту
                        onRate={onRateColor}
                    />
                ))
            }
        </div>
    );
}

// 
function App_Up() {

    // 
    const [colors, setColors] = useState(colorData.colors);

    //
    return (
        <div>
            <h1>Передача обработчиков вверх по дереву компонентов.</h1>
            <ColorList_Up
                colors={colors}
                // корневой компонент обладает состоянием, поэтому здесь можно  
                //      выполнить удаление по идентификатору
                onRemoveColor={id => {
                    // идентификатор используется для фильтрации, чтобы удалить цвет
                    const newColors = colors.filter(color => color.id !== id);
                    // обновить состояние, старый массив цветов заменяется новым
                    setColors(newColors);
                    // после обновления состояния, вызывается повторный рендеринг
                    //      корневого сомпонента с новым массивом, который передается
                    //      дальше, что вызывает обновление всего дерева компонентов
                }}
                // чуть более длинная цепочка от пользовательского события onSelect 
                //      в дочернем компоненте к реальному обработчику в корневом 
                //      компоненте
                onRateColor={(id, rating) => {
                    const newColors = colors.map(color =>
                        color.id === id ? { ...color, rating } : color
                    );
                    setColors(newColors);
                }}
            />
        </div>
    );
}

// 
render(<App_Up />, document.getElementById("root-flow-up"));