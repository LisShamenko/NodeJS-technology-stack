import React, { useState, Fragment } from "react";
import { render } from "react-dom";



// --------------- 2. CSS в React.

import "./style.css";
import "./style.scss";

// Способы применения CSS в React:
//      - CSS-in-CSS (CSS, Sass, Модули CSS, Модули CSS и Sass)
//      - CSS-in-JS (Styled Components, Emotion)
//      - Utility-First-CSS (Tailwind CSS)

import Basket_base from "./components/basket_base";
import Basket_file_css from "./components/basket_file_css";
import Basket_file_scss from "./components/basket_file_scss";
import Basket_module_css from "./components/basket_module_css";
import Basket_styled_components from "./components/basket_styled_components";
import Basket_inline_css from "./components/basket_inline_css";

// 
function App() {

    // 
    const [state, setState] = useState("CLICK ME");

    // 
    const [fruits, setFruits] = React.useState([
        { id: '1', name: 'Apple', isFavorite: false },
        { id: '2', name: 'Peach', isFavorite: true },
        { id: '3', name: 'Strawberry', isFavorite: false },
    ]);

    //
    function handleClick(item) {
        const newFruits = fruits.map((fruit) => {
            if (fruit.id === item.id) {
                return {
                    id: fruit.id,
                    name: fruit.name,
                    isFavorite: !fruit.isFavorite,
                };
            }
            else {
                return fruit;
            }
        });
        setFruits(newFruits);
    }

    // 
    return (
        <Fragment>
            <div>
                <h1 className="html">Плагин HTML.</h1>
                <h1 className="sass">Загрузчик SASS.</h1>
                <button onClick={() => setState('click')} >
                    {state}
                </button>
                <hr />
            </div>
            <div>
                <h3>No style.</h3>
                <Basket_base items={fruits} onClick={handleClick} />
                <hr />
            </div>
            <div>
                <h3>Файл CSS.</h3>
                <Basket_file_css items={fruits} onClick={handleClick} />
                <hr />
            </div>
            <div>
                <h3>Файл SCSS.</h3>
                <Basket_file_scss items={fruits} onClick={handleClick} />
                <hr />
            </div>
            <div>
                <h3>Модульный CSS.</h3>
                <Basket_module_css items={fruits} onClick={handleClick} />
                <hr />
            </div>
            <div>
                <h3>Библиотека styled-components.</h3>
                <Basket_styled_components items={fruits} onClick={handleClick} />
                <hr />
            </div>
            <div>
                <h3>Встроенные стили React.</h3>
                <Basket_inline_css items={fruits} onClick={handleClick} />
                <hr />
            </div>
        </Fragment>
    );
}

// 
render(<App />, document.getElementById("root"));