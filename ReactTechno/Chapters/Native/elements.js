// DOM API - набор объектов для взаимодействия с моделью DOM
//      https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model

// --------------- 1. Элементы React.

// --- 1.1 Создание элемента React.

// React отображает дочерние элементы с помощью метода props.children, 
//      элемент ul с дочерними элементами li с помощью React.createElement:
const list = React.createElement(
    "ul",
    // элементы React используют 'classname' вместо 'class', чтобы добавить 
    //      атрибут 'class' к элементу HTML, поскольку ключевое слово 'class' 
    //      зарезервировано в JavaScript
    { className: "instructions" },
    // каждый дополнительный аргумент является еще одним дочерним элементом,
    //      React создает массив дочерних элементов и помещает его в props.children
    React.createElement("li", null, "first"),
    React.createElement("li", null, "second"),
    React.createElement("li", null, "third"),
);
console.log('--- ' + list);

// 
const dish = React.createElement("h1", null, "Baked Salmon");
const dessert = React.createElement("h2", null, "Coconut Cream Pie");

// отобразить элемент React в DOM можно с помощью метода ReactDOM.render, 
//      до React 16 в DOM можно было отображать только один элемент
ReactDOM.render([dish, dessert], document.getElementById("root-list"));
//          Аргументы:
//          1. элемент React или массив элементов
//          2. целевой узел, в котором нужно отобразить элемент

// --- 1.2 Элементы с данными.

// Преимуществом React является его способность отделять данные от элементов UI.
//      Используя массив с данными можно создать элементы React без необходимости 
//      жесткого кодирования каждого из них.

// 
const items = ["first", "second", "third"];
const itemsMap = React.createElement(
    "ul",
    { className: "ingredients" },
    // создать элемент React для каждого ингредиента в массиве
    items.map((ingredient, i) =>
        // при создании элементов путем итерации по массиву, React требует,
        //      чтобы каждый элемент имел свойство key, которое помогает React
        //      эффективно обновлять DOM
        React.createElement("li", { key: i }, ingredient)
    )
);
ReactDOM.render(itemsMap, document.getElementById("root-map"));

// --- 1.3 Старый синтаксис компонента React.

// В React 16 функция React.createClass официально устарела и была перемещена 
//      в отдельный пакет под названием create-react-class. Компоненты, 
//      создаваемые функцией createClass, имеют метод render, который 
//      возвращает элементы React.

try {
    // суть компонента осталась той же: описание элемента UI, который нужно отобразить
    const old_syntax_Component = React.createClass({
        displayName: "List",
        // метод render() описывает элементы React, которые должны быть возвращены
        render() {
            return React.createElement(
                "ul",
                { className: "ingredients" },
                this.props.items.map((ingredient, i) =>
                    React.createElement("li", { key: i }, ingredient)
                )
            );
        }
    });
}
catch (err) {
    console.log(`--- error = ${err}`);
}

// --- 1.4 Новый синтаксис компонента React.

// Компоненты позволяют повторно использовать одну и ту же структуру, а затем 
//      заполнять эти структуры разными наборами данных.

// компонент инкапсулируется в функцию
function new_syntax_Component(props) {
    // рендеринга любого количества элементов li
    return React.createElement(
        "ul",
        { className: "ingredients" },
        // массив items доступен из свойства props компонента React
        props.items.map((ingredient, i) =>
            React.createElement("li", { key: i }, ingredient)
        )
    );
}

// Наследование от React.Component позволяет использовать синтаксис класса 
//      для создания нового экземпляра компонента. Этот синтаксис все еще 
//      поддерживается, но постепенно устаревает.

class IngredientsList extends React.Component {
    render() {
        return React.createElement(
            "ul",
            { className: "ingredients" },
            this.props.items.map((ingredient, i) =>
                React.createElement("li", { key: i }, ingredient)
            )
        );
    }
}

// набор данных:
const ingredients = ["first", "second", "third"];

// свойство items передается в createElement, компонент будет отображать каждый 
//      элемент из списка ingredients
ReactDOM.render(
    React.createElement(IngredientsList, { items: ingredients }, null),
    document.getElementById("root-ingredients")
);