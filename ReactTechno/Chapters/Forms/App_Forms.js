import { v4 } from "uuid";
import React, { useState, useRef } from "react";

// 
import colorData from "./../../data/colorData";

// --------------- 8. HTML-формы.

// Форма:
//      <form>
//          <input type="text" placeholder="..." required />
//          <input type="color" required />
//          <button></button>
//      </form>

// --- 8.1 Неконтролируемые компоненты.

//      ╭────────────────────────────────────────────────────────╮
//      │ Generic component                      handleUpdate    │
//      │   Uncontrolled                        ╭┄┄┄┄┄┄┄┄┄┄┄┄╮   │
//      │                                       ┆  validate  ┆   │
//      │                             ╭────── → ┤ check data ┆   │
//      │                   Synthetic │         ┆  sanitize  ┆   │
//      │                     event   │         ╰┄┄┄┄┬┄┄┄┄┄┄┄╯   │
//      │ ╭───────────────────────────┴──────╮       │ Update    │
//      │ │ <textarea                        │       │ component │
//      │ │    onChange={this.handleUpdate}> │       │ state     │
//      │ │ </textarea>                      ├ ← ────╯           │
//      │ ╰──────────────────────────────────╯ No control        │
//      ╰────────────────────────────────────────────────────────╯

// Доступ к узлу DOM можно выполнить напрямую с помощью объекта ref, который 
//      хранит значения в течении всего времени жизни компонента. 

// 
function AddColorForm_Ref({ onNewColor = f => f }) {

    // хук useRef используется для создания ссылок:
    //      txtTitle ссылается на текстовое поле в форме для ввода заголовка
    //      hexColor обеспечивает доступ к значениям цвета HTML
    const txtTitle = useRef();
    const hexColor = useRef();

    // 
    const submit = e => {

        // Форма HTML делает POST-запрос по умолчанию на текущий URL-адрес 
        //      со значениями элементов формы, хранящимися в контейнере body.
        //      Функция preventDefault отключает отправку формы по умолчанию.
        e.preventDefault();

        // с помощью ссылок значения для каждого элемента формы передаются
        //      в родительский компонент через свойство-функцию onNewColor
        const title = txtTitle.current.value;
        const color = hexColor.current.value;
        onNewColor(title, color);

        // Сброс атрибутов value для компонентов input, чтобы очистить форму.
        //      Изменение атрибута value элемента DOM напрямую означает, что 
        //      компонент становится неконтролируемым. Такие компоненты
        //      не соответствуют парадигме React, поскольку только React 
        //      может менять UI в ответ на изменение состояния, но они же 
        //      предоставляют доступ к элементам DOM сторонним библиотекам.

        // значения элементов DOM изменяются напрямую
        txtTitle.current.value = "";
        hexColor.current.value = "";
    };

    // 
    return (
        <form onSubmit={submit}>
            {
                // значения для ссылок устанавливаются через атрибут ref, в объекте ref
                //      создается поле current, которое будет ссылаться на элемент DOM,
                //      что дает возможность обращаться к DOM элементам напрямую
            }
            <input ref={txtTitle} type="text" placeholder="..." required />
            <input ref={hexColor} type="color" required />
            <button>New color.</button>
        </form>
    );
}

// --- 8.2 Контролируемые компоненты.

//      ╭────────────────────────────────────────────────────────╮
//      │ Generic component                     handleUpdate     │
//      │    Controlled                        ╭┄┄┄┄┄┄┄┄┄┄┄┄╮    │
//      │                                      ┆  validate  ┆    │
//      │                             ╭───── → ┤ check data ┆    │
//      │                   Synthetic │        ┆  sanitize  ┆    │
//      │                     event   │        ╰┄┄┄┄┬┄┄┄┄┄┄┄╯    │
//      │ ╭───────────────────────────┴─────╮       │ Update     │
//      │ │ <textarea                       │       │ component  │
//      │ │    onChange={this.handleUpdate} │       │ state      │
//      │ │    value={this.state.content}>  ├ ← ────╯            │
//      │ │ </textarea>                     │ Set new value      │
//      │ ╰─────────────────────────────────╯  from state        │
//      ╰────────────────────────────────────────────────────────╯

// Контролируемый компонент - это компонент, в котором React полностью управляет 
//      создаваемой разметкой без прямого доступа к DOM, то есть без ссылок.
//      Такие компоненты могут часто рендерится в ответ на изменение состояния.

// Компонент будет повторно рендерится в следующих случаях:
// - каждый вводимый символ вызывает повторный рендеринг компонента;
// - цветовой круг приводит к еще более частым обновлениям, поскольку значение
//      цвета меняется пока пользователь перемещает мышку по цветовому кругу;
// - это нормальная нагрузка для React, но в целях оптимизации не следует
//      делать компоненты слишком тяжелыми.

// - компонент в котором элементы формы контролируются через состояние 
//      при помощи хуков 
// - компонент является управляемым, поскольку React контролирует состояние формы
function AddColorForm_State({ onNewColor = f => f }) {

    // значения title и color сохраняются через состояние
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("#000000");

    // 
    const submit = e => {
        e.preventDefault();
        // отправка формы означает передачу переменных состояния 
        //      в свойство-функцию onNewColor
        onNewColor(title, color);
        // сброс формы через обновление состояния компонента
        setTitle("");
        setColor("");
    };

    // компонент управляет значениями title и color
    return (
        <form onSubmit={submit}>
            {
                // компонент устанавливает содержимое элементов input, используя значения 
                //      title и color из состояния, это блокирует изменение формы через DOM
                //      с помощью ссылок, чтобы изменить содержимое формы следует использовать
                //      set-функций: setTitle и setColor
            }
            <input value={title} type="text" placeholder="..." required
                // событие onChange позволяет получить доступ к новому значению 
                //      элемента DOM с помощью event.target.value, где Event.target - это 
                //      ссылка на элемент DOM 
                onChange={event => setTitle(event.target.value)}
            />
            <input value={color} type="color" required
                // изменение поля пользователем инициирует событие onChange с передачей
                //      значения event.target.value, что вызовет обновление состояния
                //      компонента и повторную отрисовку компонента с новым состоянием
                onChange={event => setColor(event.target.value)}
            />
            <button>New color.</button>
        </form>
    );
}

// --- 8.3 Хук useInput.

// Хуки предназначены для использования внутри компонентов React. Один хук может 
//      использовать другой хук в своем коде, поскольку в конечном итоге все хуки
//      вызываются внутри компонентов. Изменение состояния компонента внутри хука
//      вызывает повторный рендеринг этого компонента.

// хук упрощает создание элементов input в форме
const useInput = initialValue => {

    // хук useState используется для создания состояния 
    const [value, setValue] = useState(initialValue);

    // хук возвращает массив:
    return [
        // первое значение это объект, содержащий значение value из состояния и
        //      функцию onChange, которая изменяет это значение в состоянии
        { value, onChange: e => setValue(e.target.value) },
        // второе значение это функция для сброса свойства value к начальному 
        //      значению
        () => setValue(initialValue)
    ];
};

// 
function AddColorForm_Hook({ onNewColor = f => f }) {

    // хук useInput позволяет создает свойства, поскольку внутри него 
    //      инкапсулирован хук useInput
    const [titleProps, resetTitle] = useInput("");
    const [colorProps, resetColor] = useInput("#000000");

    // 
    const submit = e => {
        e.preventDefault();
        // отправка значений хука
        onNewColor(titleProps.value, colorProps.value);
        // пользовательские функции сброса
        resetTitle();
        resetColor();
    };

    // 
    return (
        <form onSubmit={submit}>
            {
                // значения получаемые при помощи хука деструктурируются в свойства
            }
            <input {...titleProps} type="text" placeholder="..." required />
            <input {...colorProps} type="color" required />
            <button>New color.</button>
        </form>
    );
}

// 
function App_Forms() {

    // 
    const [colors, setColors] = useState(colorData.colors);

    // 
    return (
        <div>
            <h1>Список цветов.</h1>
            {colors.map(item => (
                <div key={item.id} style={{ height: 50, backgroundColor: item.color }} />
            ))}
            <h1>Использование ссылок.</h1>
            <AddColorForm_Ref
                onNewColor={(title, color) => {
                    const newColors = [...colors, { id: v4(), rating: 0, title, color }];
                    setColors(newColors);
                }}
            />
            <h1>Использование состояний.</h1>
            <AddColorForm_State
                onNewColor={(title, color) => {
                    const newColors = [...colors, { id: v4(), rating: 0, title, color }];
                    setColors(newColors);
                }}
            />
            {
                // родительский компонент не волнует природа дочерних компонентов:
                //      управляемые или неконтролируемые
            }
            <h1>Использование хуков.</h1>
            <AddColorForm_Hook
                onNewColor={(title, color) => {
                    // новый цвет сохраняется в массиве цветов, что приведет 
                    //      к повторному рендерингу
                    const newColors = [
                        ...colors,
                        { id: v4(), rating: 0, title, color }
                    ];
                    setColors(newColors);
                }}
            />
        </div>
    );
}

//
export default App_Forms;