import { createStore, combineReducers, applyMiddleware } from 'redux';
import { v4 } from 'uuid';
import colorData from './../../data/colorData';

// Redux
//      https://redux.js.org/
//      https://redux.js.org/tutorials/fundamentals/part-1-overview
//      https://gist.github.com/gaearon/ffd88b0e4f00b22c3159



// --------------- 15. Redux.

// Redux это реализация архитектуры Flux. Redux упрощает Flux за счет удаления 
//      диспетчера и использования только одного хранилища. Redux использует
//      редукторы для обновления состояния приложения.

// Редукторы (reducers) - это чистые функции, возвращающие новое состояние 
//      на основе текущего состояния и действия: (state, action) => newState.

// --- 15.1 Состояние.

// Redux: Three Principles. 
//      http://redux.js.org/docs/introduction/ThreePrinciples.html

// Правило: в приложениях Redux состояние следует хранить в как можно меньшем 
//      количестве объектов. Это правило также справедливо для чистых приложений 
//      React или Flux.

// При создании приложения Redux состояние является ключевым элементом, поэтому
//      рекомендуется в первую очередь составить JSON дерева состояния с точками 
//      заполнения данных.

// --- 15.2 Действия.

// Redux: Actions 
//      http://redux.js.org/docs/basics/Actions.html

// Правило: состояние должно храниться в одном неизменяемом объекте, который
//      будет обновляться за счет его полной замены. 

// Действия предоставляют инструкции для внесения изменений в состояние 
//      приложения и данные необходимые для этих изменений. Действия являются 
//      единственным способом обновления состояния. Действия могут рассматриваться, 
//      как записи истории изменений.

// константы
const constants = {
    ADD_COLOR: "ADD_COLOR",
    REMOVE_COLOR: "REMOVE_COLOR",
    SORT_COLORS: "SORT_COLORS",
    RATE_COLOR: "RATE_COLOR",
};

// действие - это объект JavaScript, имеющий как минимум поле type
//  {
//      // тип действия задается строковой константой, которая прописывается
//      //     заглавными буквами со знаками подчеркивания
//      type: constants.RATE_COLOR,
//      // целевые данные действия - это данные необходимые для внесения изменений
//      id: "0", rating: 4,
//  }

// --- 15.3 Редукторы.

// Redux: Reducers
//      http://redux.js.org/docs/basics/Reducers.html

// В Redux модульность достигается за счет редукторов - функций, которые используются
//      для обновления ветвей дерева состояния. Редукторы получают текущее состояние и
//      действие, чтобы создать и вернуть новое состояние. Редукторы обновляющие 
//      отдельные ветки состояния объединяются в один, чтобы управлять состоянием
//      всего приложения.

//      ╔═══════════════════════════════════════════════════════╗
//      ║                                      ┌─────────┐      ║
//      ║                                ╭─────┤ {color} │      ║
//      ║                                │     └─────────┘      ║
//      ║               ┌──────────┐     │     ┌─────────┐      ║
//      ║          ╭────┤ [colors] ├─────┼─────┤ {color} │      ║
//      ║ ╭───╮    │    └──────────┘     │     └─────────┘      ║
//      ║ │   ├────┤                     │     ┌─────────┐      ║
//      ║ ╰───╯    │    ┌────────┐       ╰─────┤ {color} │      ║
//      ║          ╰────┤ "sort" │             └─────────┘      ║
//      ║               └────────┘                              ║
//      ║ ───────────────────────────────────────────────────── ║  
//      ║               ┌─────────────╮        ┌─────────────╮  ║
//      ║               │ ADD_COLOR   ╰╮       │ ADD_COLOR   ╰╮ ║
//      ║          ╭────┤ REMOVE_COLOR ├── → ──┤              │ ║
//      ║          │    │ RATE_COLOR  ╭╯       │ RATE_COLOR  ╭╯ ║
//      ║          │    └┬───────────┬╯        └┬───────────┬╯  ║
//      ║ ╭───╮    │     │ return [] │          │ return {} │   ║
//      ║ │   ├────┤     └───────────┘          └───────────┘   ║
//      ║ ╰───╯    │                                            ║
//      ║          │    ┌─────────────╮                         ║
//      ║          │    │             ╰╮                        ║
//      ║          ╰────┤ SORT_COLORS  │                        ║
//      ║               │             ╭╯                        ║
//      ║               └┬───────────┬╯                         ║
//      ║                │ return "" │                          ║
//      ║                └───────────┘                          ║
//      ╚═══════════════════════════════════════════════════════╝
//      Каждый редуктор нацелен на конкретную часть дерева состояний. 
//          Возвращаемое значение и исходное состояние соответствуют 
//          своим типам данных в дереве. Редукторы обрабатывают действия, 
//          которые предназначены для обновления соответствующих ветвей 
//          дерева состояний.

// Редуктор всех цветов получает массив и возвращает массив.
//      Действия контроля коллекции цветов: 
//      ADD_COLOR - вызовет возвращение массива с новым объектом цвета
//      REMOVE_COLOR - 
//      RATE_COLOR - действие нацелено на местоположение в массиве цвета
const colorsStub = (state = [], action) => [];

// Редуктор цвета получает объект и возвращает объект. 
//      Действия для изменения цвета: 
//      ADD_COLOR - создает новый объект цвета
//      RATE_COLOR - изменяет поле rating отдельно взятого объекта color
const colorStub = (state = {}, action) => { };

// Редуктор сортировки получает строку и возвращает строку.
//      Действие сортировки: SORT_COLORS.
const sortStub = (state = "TITLE", action) => "";

// Redux не требует создавать целенаправленные редукторы и объединять их в один. 
//      Можно создать один редуктор для обработки всего действия, но это лишает
//      код преимуществ модульности и функционального программирования.

// --- 15.4 Редуктор Color.

// редуктор отвечает за отдельные объекты color
const color = (state = {}, action) => {
    switch (action.type) {

        // действие ADD_COLOR возвращает объект с целевыми данными
        case constants.ADD_COLOR:
            return {
                id: action.id,
                title: action.title,
                color: action.color,
                rating: 0
            };

        // действие RATE_COLOR возвращает новый объект с указанным 
        //      целевым свойством
        case constants.RATE_COLOR:
            if (state.id === action.id) {
                return { ...state, rating: action.rating };
            }
            return state;

        // если редуктор был вызван с неопознанным действием, то он должен
        //      возвращать текущее состояние по умолчанию
        default: return state;
    }
}

// вызвать редуктор с действием ADD_COLOR
let change1 = color(
    // текущее состояние
    {},
    // действие ADD_COLOR с целевыми данными, редукторы не должны содержать 
    //      побочных эффектов, поэтому идентификатор сгенерирован до отправки 
    //      действия в редуктор
    { type: constants.ADD_COLOR, id: "1", color: "#0000FF", title: "Big Blue" }
);
console.log(`--- результат редуктора 'color': ADD_COLOR = ${change1}`);

// вызвать редуктор с действием RATE_COLOR
let change2 = color(
    // текущее состояние
    { id: "1", title: "Big Blue", color: "#0000FF", rating: 0 },
    // действие RATE_COLOR с целевыми данными
    { type: constants.RATE_COLOR, id: "1", rating: 4 }
);
console.log(`--- результат редуктора 'color': RATE_COLOR = ${change2}`);

// --- 15.5 Редуктор Colors.

// редкутор отвечает за всю ветвь colors
const colors = (state = [], action) => {
    switch (action.type) {

        // действие ADD_COLOR создает массив с добавлением нового объекта 
        //      color, который создается при помощи редуктора color
        case constants.ADD_COLOR:
            return [...state, color({}, action)]

        // действие RATE_COLOR возвращает новый массив, который будет
        //      содержать модифицированный объект color
        case constants.RATE_COLOR:
            return state.map(c => color(c, action))

        // действие REMOVE_COLOR возвращает отфильтрованный массив 
        case constants.REMOVE_COLOR:
            return state.filter(c => c.id !== action.id)

        // 
        default: return state
    }
}

// вызов редуктора
let change3 = colors(
    [
        { id: "1", title: "Big Blue", color: "#0000FF", rating: 0 },
    ],
    { type: constants.ADD_COLOR, id: "1", title: "Berry Blue", color: "#000066" }
);
console.log(`--- результат редуктора 'colors': ADD_COLOR = ${change3}`);

// --- 15.6 Редуктор Sort.

// 
const sort = (state = "TITLE", action) => {
    return (action.type === constants.SORT_COLORS) ? action.sortBy : state;
}

// 
let change4 = sort(
    "RATING",
    {
        type: constants.SORT_COLORS,
        sortBy: "RATING"
    }
);
console.log(`--- результат редуктора 'sort': SORT_COLORS = ${change4}`);

// --- 15.7 Хранилище.

// Redux, Store. 
//      http://redux.js.org/docs/basics/Store.html

// Хранилище - это объект, который хранит состояние приложения и выполняет 
//      обновление состояния, пропуская текущее состояние и действие через 
//      единый редуктор. Redux допускает использование только одного хранилища.

// создать хранилище с редуктором color
const storeReducer = createStore(color);
// метод getState возвращает текущее состояние
console.log(`--- store with color reducer: 
    ${storeReducer.getState()}
`);

// функция combineReducers создает комбинацию из редукторов, которые используются 
//      для создания дерева состояний, имена полей состояния будут соответствовать
//      названиям редукторов
const commonReducer = combineReducers({ colors, sort });
// createStore принимает скомбинированный редуктор и начальное состояние (initialState)
const storeReducers = createStore(commonReducer, colorData);
console.log(`--- store with combine reducers: 
    ${JSON.stringify(storeReducers.getState())}
`);

// Хранилище позволяет осуществлять подписку для отслеживания изменений состояния.
//      Обработчики вызываются после каждой действия. Метод subscribe возвращает 
//      функцию, при вызове которой можно отписаться от хранилища.
const unsubscribe = storeReducers.subscribe(() =>
    console.log(`--- update store: ${JSON.stringify(storeReducers.getState())}`)
);

// диспетчеризация действий через хранилище позволяет изменить состояния
//      приложения:
storeReducers.dispatch({ type: "ADD_COLOR", id: "5", title: "Party Pink", color: "#F142FF" });
storeReducers.dispatch({ type: "RATE_COLOR", id: "5", rating: 5 });
console.log(`--- store after dispatch: 
    ${JSON.stringify(storeReducers.getState())}
`);

// завершить отслеживание
unsubscribe();

// --- 15.8 localStorage.

// загрузка начального состояния из локального хранилища
function getInitialState() {
    let initialState = localStorage['store-1'];
    return (initialState) ? JSON.parse(initialState) : {};
}

// 
const storeJSON = createStore(
    combineReducers({ colors, sort }),
    getInitialState()
);

// сохранение текущего состояния в локальное хранилище
storeJSON.subscribe(() =>
    localStorage['store-1'] = JSON.stringify(storeJSON.getState())
);

// --- 15.9 Action Creators.

// Создатели действий - это функции, которые создают и возвращают объектные 
//      литералы действий. Создатели упрощают задачу диспетчеризации действий,
//      достаточно вызвать функцию и передать ей данные. Создатели действий 
//      должны содержать логику обмена данными с серверными API.

// 
export const removeColor = (id) => (
    { type: constants.REMOVE_COLOR, id }
);

// 
export const rateColor = (id, rating) => (
    { type: constants.RATE_COLOR, id, rating }
);

// 
export const sortColors = (sortedBy) => {
    if (sortedBy === "rating") {
        return { type: constants.SORT_COLORS, sortBy: "RATING" };
    }
    else {
        return { type: constants.SORT_COLORS, sortBy: "TITLE" };
    }
}

// перемещение логики генерации в создатель действий
export const addColor = (title, color) => ({
    type: constants.ADD_COLOR,
    // создать ID v4, в создателе действий можно устанавливать
    //      время по часовому поясу клиента
    id: v4(),
    title: title,
    color: color
});

// диспетчеризация действий с использованием 'Action Creators'
storeJSON.dispatch(removeColor("0"));
storeJSON.dispatch(rateColor("1", 5));
storeJSON.dispatch(sortColors("rating"));
storeJSON.dispatch(addColor("#F142FF", "Party Pink"))

// --- 15.10 Middleware.

// Middleware в Redux - это функции высшего порядка, которые последовательно 
//      выполняются в конвейере диспетчеризации и позволяют добавить дополнительную
//      обработку действий до срабатывания редукторов и обновления состояния хранилища.

// 
const logger = store => next => action => {
    // показать текущее состояние
    console.log('--- store state = ', store.getState());
    // передать действие к следующему в конвейере middleware
    next(action);
    // показать новое состояние
    console.log('--- store state = ', store.getState());
}

// 
const saveJSON = store => next => action => {

    // Функция имеет доступ к действию, хранилищу и функции перехода 
    //      к следующему middleware.

    // next вызывается с действием, что приводит к изменению состояния,
    //      после чего новое состояние сохраняется в localStorage
    let result = next(action);
    localStorage['store-2'] = JSON.stringify(store.getState());
    return result;
}

// 
const loadJSON = (initialState) => {
    let state = localStorage['store-2'];
    return state ? JSON.parse(state) : initialState;
}

// фабрика выполняет группировку всего необходимого для создания хранилища
export const storeFactory = (initialState) => {
    return createStore(
        combineReducers({ colors, sort }),
        loadJSON(initialState),
        applyMiddleware(logger, saveJSON)
    );
}

// 
const store = storeFactory(colorData);
store.dispatch(addColor("#FFFFFF", "Bright White"))
store.dispatch(addColor("#00FF00", "Lawn"))
store.dispatch(addColor("#0000FF", "Big Blue"))
console.log(`--- store factory: 
    ${JSON.stringify(store.getState())}
`);

// 
localStorage['store-1'] = '';
localStorage['store-2'] = '';