import React, { createContext, useContext, useState } from "react";
import { v4 } from "uuid";
import { render } from "react-dom";

import colorData from "./../../../data/colorData";



// --- 4.4 Пользовательский поставщик.

// Поставщик может поместить объект в контекст, но не может его изменять. 
//      Для этого требуется пользовательский поставщик - это компонент, который 
//      отслеживает состояние и рендерит поставщика контекста. Если состояние 
//      компонента меняется, то он повторно рендерит поставщика контекста и его 
//      дочерние компоненты с новыми данными. 

// Контекст содержится в модуле, но доступен через хук, поскольку контекст
//      возвращается при помощи хука useContext, который имеет доступ 
//      к CustomContext.

// локальный контекст, нельзя получить доступ напрямую к переменной из других
//      файлов
const CustomContext = createContext();

// хук позволяет дочерним компонентам провайдера получить доступ к контексту
export const useCustomContext = () => useContext(CustomContext);

// кастомный провайдер и хук контекста находятся в одном файле, чтобы получить
//      локально доступ к одному объекту контекста, вызов хука в дочерних 
//      компонентах дает возможность получить контекст используемый в провайдере
export default function CustomProvider({ children }) {

    // переменная состояния
    const [colors, setColors] = useState(colorData.colors);

    // Более надежный подход заключается в том, чтобы предоставить только  
    //      те методы изменения контекста, которые действительно необходимы,
    //      не открывая доступ к set-функции.

    // добавление
    const addColor = (title, color) =>
        setColors([
            ...colors,
            { id: v4(), rating: 0, title, color }
        ]);

    // оценка
    const rateColor = (id, rating) =>
        setColors(
            colors.map(color => (color.id === id ? { ...color, rating } : color))
        );

    // удаление
    const removeColor = (id) =>
        setColors(
            colors.filter(color => color.id !== id)
        );

    // рендеринг поставщика контекста
    return (
        // отображает компонент CustomContext.Provider, переносит переменную 
        //      colors и функцию setColors в контекст, используя свойство value,
        <CustomContext.Provider value={{ colors, setColors, addColor, rateColor, removeColor }}>
            {
                // дочерние компоненты получат доступ к переменной colors и 
                //      функции setColors, что позволит им изменять состояние
                //      пользовательского поставщика
                children
            }
        </CustomContext.Provider>
    );
};