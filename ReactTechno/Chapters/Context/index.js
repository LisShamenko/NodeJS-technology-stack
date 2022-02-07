import React, { createContext, useContext } from "react";
import { render } from "react-dom";

import colorData from "./../../data/colorData";
import ColorList from "./components/ColorList";
import AddColorForm from "./components/AddColorForm";
import CustomProvider from "./providers/CustomProvider";



// --------------- 4. Контекст React.

// По мере роста дерева компонентов сохранение состояния в одном месте может 
//      сильно усложнится, так как потребуется двухстороняя передача данных и 
//      сигналов управления через длинные цепочки компонентов. Это утомительно и
//      может приводить к ошибкам. Компонент получают свойства, которые передают
//      потомкам. Это раздувает код и затрудняет масштабирование.

// Контекст React - это механизм позволяющий подключать данные состояния 
//      к компонентам внутри дерева компонентов. Разместить данные в контексте 
//      можно создав поставщика. Поставщик контекста (Provider) - это компонент, 
//      который поставляет данные своим потомкам, он может включать все дерево 
//      компонентов или его часть. Потребители контекста (Consumer) - это компоненты, 
//      которые извлекают данные из контекста. Контекст позволяет хранить данные 
//      в одном месте и избавляет от передачи данных по длинным цепочкам компонентов.

// --- 4.1 Контекст ColorContext.

// Функция createContext используется для создания объекта контекста, который 
//      содержит два компонента: Provider и Consumer. Provider помещает данные 
//      в контекст. Consumer позволяет получить доступ к данным.

// поставщик должен быть экспортирован из файла в котором он используется, чтобы
//      другие компоненты могли получить доступ к ColorContext.Consumer
const ColorContext = createContext();

// 
render(
    // поставщик ColorContext помещает данные в контекст при помощи свойства value,
    //      поставщик предоставляет значения контекста только своим дочерним элементам
    <ColorContext.Provider value={{ colors: colorData.colors }}>
        {
            // компонент App_Context обёрнут поставщиком, что делает массив colors 
            //      доступным для любых потребителей контекста в дереве компонентов 
            //      App_Context
            <App_Context />
        }
    </ColorContext.Provider>,
    document.getElementById("root-color-context")
);

// 
function App_Context() {
    return (
        <>
            <h1>Контекст ColorContext.</h1>
            <ColorList_Hook />
            <hr />
            <ColorList_Consumer />
        </>
    );
}

// упрощенный компонент Color для демонстрации
function Color({ title, color }) {
    return (
        <section>
            <h1>{title}</h1>
            <div style={{ height: 50, backgroundColor: color }} />
        </section>
    );
}

// --- 4.2 Хук useContext.

// компонент может использовать данные из контекста
function ColorList_Hook() {

    // хук useContext получает данные из контекста, экземпляр ColorContext 
    //      должен импортироваться из файла, в котором создается контекст и
    //      добавляется поставщик
    const { colors } = useContext(ColorContext);

    //
    if (!colors.length) {
        return (<div>No Colors!</div>);
    }

    // 
    return (
        <div className="color-list">
            {
                colors.map(color => <Color key={color.id} {...color} />)
            }
        </div>
    );
}

// --- 4.3 Использование потребителя.

// Хук useContext позволяет получить доступ к компоненту Consumer и напрямую
//      обращаться к потребителю не требуется. Без хука useContext следует
//      использовать свойства рендеринга в потребителе контекста: context.

function ColorList_Consumer() {
    return (
        <ColorContext.Consumer>
            {context => {
                if (!context.colors.length) {
                    return <div>No Colors.</div>;
                }
                return (
                    <div className="color-list">
                        {
                            context.colors.map(color => <Color key={color.id} {...color} />)
                        }
                    </div>
                )
            }}
        </ColorContext.Consumer>
    )
}

// --- 4.4 Пользовательский поставщик.

// Описание в файле: './providers/CustomProvider.js'

// --- 4.5 Пользовательские хуки с контекстом.

// Код можно упростить, если заключить контекст в хук, что избавит компоненты
//      потребители от загрузки контекста из файла.

// 
function App_Provider() {
    return (
        <>
            <h1>Пользовательский поставщик.</h1>
            <AddColorForm />
            <ColorList />
        </>
    );
}

// применение провайдера:
render(
    // любой дочерний компонент получает доступ к контексту
    <CustomProvider>
        <App_Provider />
    </CustomProvider>,
    document.getElementById("root-custom-provider")
);

// --- 4.6 Применение хука с контекстом.

// Компоненты:
//  ./components/
//      AddColorForm
//      ColorList
//       ↓ - use
//      Color