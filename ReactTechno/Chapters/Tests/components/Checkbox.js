import React, { useReducer } from "react";

export default function Checkbox() {

    // компонент использует хук useReducer для переключения флага, тест 
    //      компонента должен устанавливать флаг checked с false на true и 
    //      проверять хук useReducer
    const [checked, setChecked] = useReducer(checked => !checked, false);

    //
    return (
        <>
            <label>
                {checked ? "checked" : "not checked"}
                <input type="checkbox" value={checked} onChange={setChecked}
                    // атрибут 'data-testid' позволяет находить элемент в тестах
                    //      при помощи функции getByTestId
                    data-testid="checkbox"
                />
            </label>
        </>
    );
}