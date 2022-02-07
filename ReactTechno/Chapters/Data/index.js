import React from "react";
import { render } from "react-dom";
import PropTypes from "prop-types";

// Immutable JS
//      facebook.github.io/immutable-js/

// prop-types - набор функций и свойств, которые помогают выполнить проверку типов
//      github.com/facebook/prop-types

// Preact 
//      preactjs.com

// --------------- 3. Состояние программы.

// --- 3.1 Состояние и свойства компонента.

// Компонент React имеет два хранилища данных:
// - изменяемое состояние this.state или просто состояние компонента, данные 
//      в этом хранилище можно изменять внутри компонента при помощи специальных 
//      методов React;
// - неизменяемое состояние this.props или просто свойства компонента, данные 
//      в этом хранилище нельзя изменять внутри компонента, поскольку они 
//      изменяются и передаются родительским компонентом.

// --- 3.2 Состояние this.state.

// Компоненты, наследующиеся от React.Component, получат доступ к изменяемому 
//      состоянию через this.state, где this относится к экземпляру класса, 
//      state особое свойство, которое React отслеживает автоматически.

// работа с состоянием компонента
class Secret extends React.Component {
    constructor(props) {
        super(props);

        // начальное состояние компонента
        this.state = {
            code: '0'
        };

        // привязка методов
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    // Процесс обновления состояния:
    //      - нажатие на кнопку мыши;
    //      - генерируется событие onClick;
    //      - вызывается обработчик onButtonClick, внутри которого 
    //           вызывается this.setState;
    //      - React запланирует обновление состояния и обновит DOM 
    //           при необходимости;
    //      - render вызываться с обновленными данными, доступными JSX.

    // setState возвращает новый объект состояния для использования React
    onButtonClick() {
        this.setState({
            code: this.state.code + '0'
        });
    }

    // 
    render() {
        return (
            <div>
                <h1>Secret: {this.state.code}</h1>
                <button onClick={this.onButtonClick}>++</button>
            </div>
        );
    }
}

// 
render(<Secret />, document.getElementById("main-secret"));

// Свойство this.state нельзя изменять напрямую, поскольку метод this.setState 
//      не сразу изменяет состояние и изменения сделанные напрямую могут быть 
//      сброшены после обновления React. 

// Метод this.setState выполняет не глубокое копирование данных в объект 
//      this.state, то есть сохраняются только свойства верхнего уровня, 
//      избежать ограничения можно при помощи 'Immutable JS'.
//
//      setState(
//          updater,        
//              // сигнатура фнукции updater: (prevState, props) => stateChange
//              // текущее состояние перед его изменением можно получить через 
//              // аргументы prevState и props
//          [callback]
//              // функция обратного вызова, позволяет отследить процесс завершения
//      ) -> void

// 
class ShallowMerge extends React.Component {
    constructor(props) {
        super(props);

        //
        this.state = {
            user: {
                name: "USER",
                secret: {
                    code: "0"
                }
            }
        };

        // 
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    // 
    onButtonClick() {
        // при нажатии кнопки свойство name исходного состояния будет 
        //      перезаписано, поскольку оно не существует в новом состоянии
        this.setState({
            user: {
                // 
                secret: {
                    code: this.state.user.secret.code + '0'
                }
            }
        });
    }

    // 
    render() {
        return (
            <div>
                <h1>Merge: {this.state.user.name} - {this.state.user.secret.code}</h1>
                <button onClick={this.onButtonClick}>++</button>
            </div>
        );
    }
}

// 
render(<ShallowMerge />, document.getElementById("main-merge"));

// --- 3.3 Свойства props.

// Свойства являются основным способом передачи неизменяемых данных. React 
//      использует метод Object.freeze, чтобы имитировать неизменяемые 
//      свойства, это предотвращает добавление новых свойств, удаление и 
//      изменение существующих.

// Свойства - это данные, которые передаются компонентам React либо из родителя, 
//      либо из статического метода defaultProps самого компонента, при этом 
//      данные являются неизменяемыми в рамках компонента. Состояние компонента
//      может передаваться дочерним компонентам в качестве свойств. Свойства 
//      передаются как атрибуты элементов в JSX или при помощи метода 
//      React.createElement. Могут передаваться любые допустимые данные 
//      JavaScript и даже другие компоненты, которые являются классами.

// 
class Counter extends React.Component {

    // ошибка: Babel 6 не поддерживает статические свойства
    // 
    //      // в свойстве propTypes указываются необходимые компоненту свойства и 
    //      //      задается валидация типов
    //      static propTypes = {
    //          //Specify an object with a “shape.”
    //          incrementBy: PropTypes.number,
    //          //
    //          onIncrement: PropTypes.func.isRequired
    //      }
    //      // в свойстве defaultProps указываются свойства по умолчанию
    //      static defaultProps = {
    //          incrementBy: 1
    //      }

    // 
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    // 
    onButtonClick() {
        this.setState(function (prevState, props) {
            props.onIncrement();
            return {
                count: prevState.count + props.incrementBy
            };
        });
    }

    // 
    render() {
        return (
            <div>
                <h1>Counter: {this.state.count}</h1>
                <button onClick={this.onButtonClick}>++</button>
            </div>
        );
    }
}

//
Counter.propTypes = {
    incrementBy: PropTypes.number,
    onIncrement: PropTypes.func.isRequired
}

// в свойстве defaultProps указываются свойства по умолчанию
Counter.defaultProps = {
    incrementBy: 1
}

// 
render(
    <Counter
        incrementBy={1}
        onIncrement={() => console.log('onIncrement')}
    />,
    document.getElementById("main-counter")
);

// --- 3.4 Функциональные компоненты без состояния.

// Функциональный компонент без состояния - это компонент, который не наследуется
//      от React.Component, поэтому не получает доступ к состоянию и методам 
//      жизненного цикла. Такие компоненты могут использовать только свойства и 
//      считаются чистыми, поскольку возвращают один и тот же результат на основе 
//      заданного ввода.

// Функциональные компоненты используются как средство оптимизации. Вместо 
//      нескольких компонентов имеющих состояние, создается один такой компонент, 
//      который передает свойства дочерним функциональным компонентам без состояний.

// функциональные компоненты создаются при помощи функций
function FunctionalComponent(props) {
    return (<div>{props.code}!</div>);
}

// для функционального компонента можно указать propTypes и defaultProps
FunctionalComponent.propTypes = {
    code: PropTypes.string.isRequired
};
FunctionalComponent.defaultProps = {
    code: "0000"
};

// 
render(
    <FunctionalComponent code="1234" />,
    document.getElementById("main-functional-component")
);

// --- 3.5 Связь компонентов.

// функциональный компонент, который возвращает элемент изображения
const UserProfile = props => {
    return <img src={`https://source.unsplash.com/user/${props.username}`} />;
};
UserProfile.propTypes = {
    username: PropTypes.string
};
UserProfile.defaultProps = {
    username: "default name"
};

// функциональный компонент, который возвращает ссылку
const UserProfileLink = props => {
    return <a href={`https://ifelse.io/${props.username}`}>{props.username}</a>;
};

// родительский функциональный компонент
const UserCard = props => {

    // Связь компонентов происходит через передачу свойств:
    // - разрешить доступ к данным в родителе (состояние или свойство);
    // - передать эти данные дочернему компоненту.

    // 
    return (
        <div>
            <UserProfile username={props.username} />
            <UserProfileLink username={props.username} />
        </div>
    );
};

// 
render(
    <UserCard username="erondu" />,
    document.getElementById("main-card")
);

// --- 3.6 Однонаправленный поток данных.

// Связывание данных - это процесс синхронизации между пользовательским интерфейсом и 
//      данными приложения. При двунаправленной привязке передача приосходит 
//      от UI к модели и обратно. В React данные передаются в одном направлении
//      от родительского компонента к дочерним. Соседние компоненты не могут 
//      изменять друг друга, так же как и дочерние не могут изменять родительские. 
//      Частично данные могут передаваться родителям при помощи обратных вызовов, 
//      но что с ними делать решает сам родительский компонент.

// Свойства могут меняться со временем, но не изнутри компонента, что является 
//      частью одностороннего потока данных. Измененные данные перемещаются 
//      потоком по компонентам от родителей к потомкам. Родительский компонент 
//      использует и меняет this.state, после чего измененное состояние может 
//      быть передано как свойства дочерним компонентам, таким образом изменяются 
//      свойства.

// 
import Parent from './components/Parent';
render(<Parent />, document.getElementById('main-parent'));