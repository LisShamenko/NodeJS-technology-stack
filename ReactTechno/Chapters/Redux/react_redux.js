import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import { v4 } from 'uuid';
import { FaStar, FaTrash } from "react-icons/fa";

import { Provider, connect } from 'react-redux'

import useInput from "./../../hooks/useInput";
import { addColor, rateColor, removeColor, storeFactory } from './redux_factory';
import colorData from './../../data/colorData';



// --------------- 15. React Redux.

// --- 15.1 Презентационные компоненты.

// 
function ColorForm({ onAddColor = f => f }) {

    // 
    const [titleProps, resetTitle] = useInput("");
    const [colorProps, resetColor] = useInput("#000000");

    // 
    const submit = e => {
        e.preventDefault();
        onAddColor(titleProps.value, colorProps.value);
        resetTitle();
        resetColor();
    };

    // 
    return (
        <form onSubmit={submit}>
            <input {...titleProps} type="text" required />
            <input {...colorProps} type="color" required />
            <button>submit</button>
        </form>
    );
}

// 
function ColorList({ colors = [], onRate = f => f, onRemove = f => f }) {
    return (
        <div>
            {colors && colors.map(color =>
                <Color
                    key={color.id}
                    {...color}
                    onRate={(rating) => onRate(color.id, rating)}
                    onRemove={onRemove}
                />
            )}
        </div>
    );
}

// 
function Color({ id, title, color, rating, onRate, onRemove }) {
    return (
        <section>
            <h3>{title}</h3>
            <div style={{ backgroundColor: color, height: 20 }} />
            <button onClick={() => onRemove(id)}>
                <FaTrash />
            </button>
            <div>
                <StarRating selectedStars={rating} onRate={onRate} />
            </div>
        </section>
    );
}

// 
function StarRating({ totalStars = 5, selectedStars = 0, onRate = f => f }) {
    return (
        <>
            {[...Array(totalStars)].map((n, i) => (
                <Star key={i}
                    selected={selectedStars > i}
                    onSelect={() => onRate(i + 1)}
                />
            ))}
        </>
    );
}

// 
function Star({ selected = false, onSelect = f => f }) {
    return (<FaStar color={selected ? "red" : "grey"} onClick={onSelect} />);
}

// --- 15.2 Двунаправленный поток данных.

//       App 
//      ┌──────────────────────────────────────┐
//      │        setState() ─────┼ → {state}   │
//      └─────────────↑─────────────────┬──────┘
//       ColorList    │                 │       
//      ┌─────────────┴──────────┬──────↓──────┐
//      │  onRate(index,rating)  │   {props}   │
//      └─────────────↑──────────┴──────┬──────┘
//       Color        │                 │       
//      ┌─────────────┴──────────┬──────↓──────┐
//      │       onRate(rating)   │   {props}   │
//      └─────────────↑──────────┴──────┬──────┘
//       StarRating   │                 │       
//      ┌─────────────┴──────────┬──────↓──────┐
//      │       onRate(rating)   │   {props}   │
//      └─────────────↑──────────┴─────────────┘
//       Star         │                         
//      ┌─────────────┴──────────┬─────────────┐
//      │          onClick()     │             │
//      └────────────────────────┴─────────────┘

// поток данных по дереву компонентов
function Bidirectional_Data_Flow() {

    //
    class App extends Component {
        constructor(props) {
            super(props);
            this.state = {
                colors: colorData.colors,
            }

            // 
            this.addColor = this.addColor.bind(this);
            this.rateColor = this.rateColor.bind(this);
            this.removeColor = this.removeColor.bind(this);
        }

        // 
        addColor(title, color) {
            let newColor = { id: v4(), title: title, color: color, rating: 0 };
            this.setState({
                colors: [...this.state.colors, newColor]
            })
        }
        rateColor(id, rating) {
            let color = this.state.colors.find(item => item.id === id);
            let newColor = { ...color, rating };
            let filterColors = this.state.colors.filter(item => item.id !== id);
            this.setState({
                colors: [...filterColors, newColor]
            })
        }
        removeColor(id) {
            let filterColors = this.state.colors.filter(item => item.id !== id);
            this.setState({
                colors: [...filterColors]
            })
        }

        // 
        render() {

            // В Redux вместо двусторонней передачи данных и функций, в дочерних 
            //      компонентах выполняется диспетчеризация действий для обновления 
            //      состояния.

            // 
            return (
                <div>
                    <h2>Двунаправленный поток данных.</h2>
                    <ColorForm onAddColor={this.addColor} />
                    <ColorList
                        // состояние передается вниз по иерархии компонентов
                        colors={this.state.colors}
                        // операции для обновления состояния передаются вверх
                        onRate={this.rateColor}
                        onRemove={this.removeColor}
                    />
                    <hr />
                </div>
            )
        }
    }

    //
    render(<App />, document.getElementById('main-1'));
}

// --- 15.3 Передача хранилища дереву компонентов.

// Передача хранилища явным образом вниз по дереву компонентов в виде свойства. 
//      Это вполне работоспособный подход для небольших приложений с небольшим
//      деревом компонентов. Передача хранилища в дочерние компоненты увеличивает
//      объем кода.

// 
function Passing_Store_To_Component_Tree() {

    // компонент App передает хранилище дочерним компонентам
    const App = ({ store }) => {
        return (
            <div>
                <h2>Передача хранилища дереву компонентов.</h2>
                <ColorFormTree store={store} />
                <ColorListTree store={store} />
                <hr />
            </div>
        );
    }

    // компонент не использует собственное состояние, получаемое через хуки
    //      useState или useInput, вместо этого используются ссылки ref
    function ColorFormTree({ store }) {

        // 
        let _title, _color;

        // 
        const submit = e => {
            e.preventDefault();

            // метод store.dispatch выполняет диспетчеризацию действий к хранилищу
            store.dispatch(
                // создатель действий addColor создает новое действие ADD_COLOR
                addColor(_title.value, _color.value)
            );

            // 
            _title.value = '';
            _color.value = '#000000';
            _title.focus();
        }

        // 
        return (
            <form onSubmit={submit}>
                <input ref={input => _title = input} type="text" />
                <input ref={input => _color = input} type="color" />
                <button>submit</button>
            </form>
        )
    }

    // 
    function ColorListTree({ store }) {

        // метод store.getState возвращает состояние хранилища: массив цветов и
        //      тип сортировки, 
        const { colors } = store.getState();

        // 
        return (
            <div>
                {colors && colors.map(color =>
                    <Color
                        key={color.id}
                        {...color}
                        // диспетчеризация действий RATE_COLOR и REMOVE_COLOR
                        //      при вызове соответствующих функций
                        onRate={(rating) =>
                            store.dispatch(rateColor(color.id, rating))
                        }
                        onRemove={() =>
                            store.dispatch(removeColor(color.id))
                        }
                    />
                )}
            </div>
        )
    }

    // с помощью фабрики создается хранилище
    const store = storeFactory();

    // функция отображения компонента App с передачей хранилища
    const renderAppWithStore = () => {
        // хранилище передается компоненту App
        render(<App store={store} />, document.getElementById('main-2'));
    }

    // функция render будет вызываться при каждом обновлении хранилища
    store.subscribe(renderAppWithStore);

    // запуск
    renderAppWithStore();
}

// --- 15.4 Передача хранилища через контекст.

// React: Context
//      https://facebook.github.io/react/docs/context.html

// Контекст позволяет передавать данные компонентам без использования свойств.
//      Доступ к контексту могут получить любые дочерние компоненты. Корневой
//      компонентов должен отслеживать изменения в хранилище, чтобы запускать
//      обновление интерфейса.

// 
function Passing_Store_Via_Context() {

    // 
    class App extends Component {
        constructor(props) {
            super(props);
        }

        // функция getChildContext возвращает объект, определяющий контекст,
        //      хранилище добавляется к контексту
        getChildContext() {
            return {
                store: this.props.store
            }
        }

        // подписка происходит при монтировании компонента
        componentWillMount() {
            // подписка на хранилище, дерево компонентов будет обновляться
            //      при каждом обновлении хранилища при помощи функции 
            //      this.forceUpdate, которая запускает цикл обновления
            this.unsubscribe = store.subscribe(
                () => this.forceUpdate()
            );
        }
        // отписка происходит при размонтировании компонента
        componentWillUnmount() {
            this.unsubscribe()
        }

        // 
        render() {
            const { colors } = store.getState();
            return (
                <div>
                    <h2>Передача хранилища через контекст.</h2>
                    <ColorFormContext />
                    <ColorListContext colors={colors} />
                    <hr />
                </div>
            )
        }
    }
    App.propTypes = {
        store: PropTypes.object.isRequired
    }
    // childContextTypes определяет объект контекста.
    App.childContextTypes = {
        store: PropTypes.object.isRequired
    }

    // объект контекста передается компонентам вторым аргументом
    function ColorFormContext(props, { store }) {

        // 
        let _title, _color;

        // 
        const submit = e => {
            e.preventDefault();
            store.dispatch(addColor(_title.value, _color.value));
            _title.value = '';
            _color.value = '#000000';
            _title.focus();
        }

        // 
        return (
            <form onSubmit={submit}>
                <input ref={input => _title = input} type="text" required />
                <input ref={input => _color = input} type="color" required />
                <button>submit</button>
            </form>
        )
    }
    // чтобы компонент получал контекст следует определить свойство contextTypes,
    //      так React определяет контекстные переменные используемые компонентом
    ColorFormContext.contextTypes = {
        store: PropTypes.object
    }

    // 
    function ColorListContext(props, { store }) {

        // метод store.getState возвращает состояние хранилища: массив цветов и
        //      тип сортировки, 
        const { colors } = store.getState();

        // 
        return (
            <div>
                {colors && colors.map(color =>
                    <ColorContext
                        key={color.id}
                        {...color}
                        // диспетчеризация действий RATE_COLOR и REMOVE_COLOR
                        //      при вызове соответствующих функций
                        onRate={(rating) =>
                            store.dispatch(rateColor(color.id, rating))
                        }
                        onRemove={() =>
                            store.dispatch(removeColor(color.id))
                        }
                    />
                )}
            </div>
        )
    }
    ColorListContext.contextTypes = {
        store: PropTypes.object
    }

    //
    function ColorContext({ id, title, color, rating }, { store }) {
        return (
            <section>
                <h3>{title}</h3>
                <div style={{ backgroundColor: color, height: 20 }} />
                <button
                    // диспетчеризация действия REMOVE_COLOR
                    onClick={() => store.dispatch(removeColor(id))}>
                    <FaTrash />
                </button>
                <div>
                    <StarRating
                        selectedStars={rating}
                        // диспетчеризация действия RATE_COLOR
                        onRate={rating => store.dispatch(rateColor(id, rating))}
                    />
                </div>
            </section>
        );
    }
    ColorContext.contextTypes = {
        store: PropTypes.object
    }

    // 
    const store = storeFactory();
    const renderAppWithStore = () => {
        render(<App store={store} />, document.getElementById('main-3'));
    }
    store.subscribe(renderAppWithStore);
    renderAppWithStore();
}

// --- 15.5 Презентационные и контейнерные компоненты.

// Abramov D. Presentational and Container Components.
//      https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0

// Redux: Presentational and Container Components.
//      http://redux.js.org/docs/basics/UsageWithReact.html

// Для небольших проектов этот подход может быть избыточным.

// Презентационные компоненты отвечают только за отображение пользовательского 
//      интерфейса. Такие компоненты получают данные в виде свойств и отправляют
//      родительским компонентам через функции обратного вызова. Их легко 
//      использовать повторно, тестировать и составлять из них композиции. 

// Контейнерные компоненты отвечают только для подключения презентационных 
//      компонентов к данным. Такие компоненты могут извлекать состояние через 
//      контекст и управлять операциями по взаимодействию с хранилищем. 
//      Презентационным компонентам передаются данные из хранилище в качестве 
//      свойств, а функции обратного вызова отображаются на вызовы метода dispatch.
//      Контейнерные компоненты могут повторно использоваться для подключения 
//      соответствующих презентационных компонентов.

//
function Presentational_Container_Components() {

    // 
    class App extends Component {
        constructor(props) {
            super(props);
        }
        getChildContext() {
            return { store: this.props.store }
        }
        componentWillMount() {
            this.unsubscribe = store.subscribe(() => this.forceUpdate());
        }
        componentWillUnmount() {
            this.unsubscribe()
        }
        render() {
            return (
                <div>
                    <h2>Презентационные и контейнерные компоненты.</h2>
                    <ColorFormContainer />
                    <ColorListContainer />
                    <hr />
                </div>
            )
        }
    }
    App.childContextTypes = {
        store: PropTypes.object.isRequired
    }

    // создатели действий используются только в контейнерных компонентах, так же
    //      методы store.getState и store.dispatch

    // контейнер для ColorForm
    function ColorFormContainer(props, { store }) {
        return (
            // отображает компонент ColorForm и отображает событие onAddColor
            //      на диспетчеризацию действия ADD_COLOR
            <ColorForm
                onAddColor={(title, color) => store.dispatch(addColor(title, color))}
            />
        );
    }
    ColorFormContainer.contextTypes = {
        store: PropTypes.object
    }

    // контейнер для ColorList
    function ColorListContainer(props, { store }) {
        const { colors } = store.getState()
        return (
            <ColorList
                colors={colors}
                onRemove={id => store.dispatch(removeColor(id))}
                onRate={(id, rating) => store.dispatch(rateColor(id, rating))}
            />
        )
    }
    ColorListContainer.contextTypes = {
        store: PropTypes.object
    }

    // 
    const store = storeFactory();
    const renderAppWithStore = () => {
        render(<App store={store} />, document.getElementById('main-4'));
    }
    store.subscribe(renderAppWithStore);
    renderAppWithStore();
}

// --- 15.6 React Redux.

// React Redux - это библиотека, упощающая передачу хранилища через контекст.
//      Библиотека предоставляет компонент провайдер для настройки хранилища 
//      в контексте. Любой дочерний элемент провайдера получает доступ 
//      к хранилищу через контекст.

//      https://www.npmjs.com/package/react-redux

function React_Redux() {

    // Функция connect позволяет создавать контейнерные компоненты, текущее 
    //      состояние хранилища отображается на свойства компонента, а функции
    //      диспетчеризации на функции обратного вызова.

    // Функция connect - это функция высшего порядка, создающая контейнерный 
    //      компонент, в который передается презентационный компонент.
    //      В качестве аргументов connect получает две функции: 
    //      mapStateToProps - получает состояние в виде аргумента и возвращает объект,
    //          который будет отображен на свойства;
    //      mapDispatchToProps - получает функцию dispatch, принадлежащую хранилищу,
    //          и эта функция с вызовами создателей действий отображается на обработчики
    //          событий компонентов.

    // Функция connect работает в связке с компонентом Provider:
    //      - Provider добавляет хранилище к контексту;
    //      - connect создает компоненты, извлекающие хранилище.

    // отображает переменные состояния на свойства
    const mapStateToProps = (state) => ({
        colors: [...state.colors]
    });

    // выполняет диспетчеризацию действий при выдаче событий
    const mapDispatchToProps = (dispatch) => ({
        onRemove(id) {
            dispatch(removeColor(id))
        },
        onRate(id, rating) {
            dispatch(rateColor(id, rating));
        }
    });

    // контейнер для компонента ColorList
    const ColorListContainer = connect(mapStateToProps, mapDispatchToProps)(ColorList);

    // контейнер для компонента ColorForm
    const ColorFormContainer = connect(
        // без отображения свойств
        null,
        dispatch => ({
            onAddColor(title, color) {
                dispatch(addColor(title, color))
            }
        })
    )(ColorForm);

    // корневой компонент
    function App() {
        return (
            <div>
                <h2>React Redux.</h2>
                <ColorFormContainer />
                <ColorListContainer />
                <hr />
            </div>
        );
    }

    // 
    const store = storeFactory();
    render(
        // provider добавляет хранилище к контексту и обновляет дочерний
        //      компонент после диспетчеризации действий, любые дочерние
        //      комопненты могут извлекать хранилище из контекста
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('main-5')
    );
}

// --- 15.7 Запуск.

Bidirectional_Data_Flow();
Passing_Store_To_Component_Tree();
Passing_Store_Via_Context();
Presentational_Container_Components();
React_Redux();