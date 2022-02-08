import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';



// isomorphic-fetch - дублирует стандартный API Fetch
//      github.com/matthew-andrews/isomorphic-fetch

// API Fetch
//      https://developer.mozilla.org/ru/docs/Web/API/Fetch_API

// JSDoc
//      https://www.npmjs.com/package/jsdoc
//      https://jsdoc.app/

// JSON-server
//      github.com/typicode/json-server



// --------------- 5. Рендеринг.

//      ╔═══════════════════════════════════════════════════╗
//      ║ ╭───────────────────────────────────────────────╮ ║
//      ║ │  свойства ─╮     ┊  Методы жизненного цикла   │ ║
//      ║ │            ↓     ┊     componentWillMount     │ ║
//      ║ │ <Parent key={1}> ┊     componentDidMount      │ ║
//      ║ │     <Child />    ┊ componentWillReceiveProps  │ ║
//      ║ │ </Parent>        ┊   shouldComponentUpdate    │ ║
//      ║ │ { user: ... }    ┊    componentWillUpdate     │ ║
//      ║ │   ↑ внутреннее   ┊    componentDidUpdate      │ ║
//      ║ │   ╰─ состояние   ┊   componentWillUnmount     │ ║
//      ║ ╰──────────────────┬────────────────────────────╯ ║
//      ║                    │                              ║
//      ║    ╭───────────────┴───────────────╮              ║
//      ║    │              код              │              ║
//      ║    ├───────┬───────────┬───────────┤              ║
//      ║    │ React │ React DOM │ libraries │              ║
//      ║    ╰───────┴───────┬───┴───────────╯              ║
//      ║                    │                              ║
//      ║        ╭───────────┴────────────╮                 ║
//      ║        │ environments/platforms │     ╔═══════════╣
//      ║        ╰────────────────────────╯     ║ Rendering ║
//      ╚═══════════════════════════════════════╩═══════════╝

// Рендеринг - это процесс построения и управления интерфейсом на основе 
//      компонентов и данных. В процессе рендеринга вызываются методы 
//      жизненного цикла компонентов, что дает возможность компонентам 
//      подключится к процессу рендеринга.

// Методы жизненного цикла - это специальные методы, предоставляемые классом 
//      React.Component и выполняющиеся в определенных точках жизненного цикла 
//      компонента. Функциональные компоненты не имеют этих методов. Жизненый 
//      цикл включает: монтирование, обновление и размонтирование. 

// Методы жизненного цикла компонента:
// - инициализация - при создании экземпляра класса компонента;
// - монтирование - компонент встраивается в DOM;
// - обновление - компонент обновляется через state или props;
// - размонтирование - компонент удаляется из DOM.

// --- 5.1 Свойства defaultProps и state.

// Свойства defaultProps и state не задаются специальными методами React.Component, 
//      поскольку определяются в конструкторе, но являются частью жизненного цикла.  
//      Эти свойства предоставляют исходные данные компоненту.

// Свойство defaultProps - это статическое свойство, которое определяет значения 
//      по умолчанию для свойств компонента и устанавливает свойство this.props, 
//      если оно не задано родителем. Это свойство используется до монтирования 
//      компонентов, поэтому не может полагаться на this.props или this.state. 
//      Является статическим, поэтому доступно из класса, а не из экземпляров.

// Свойство state в конструкторе определяет состояние компонента по умолчанию.

// --- 5.2 Методы монтирования.

//      ╔═══════════════════════════════════════╗
//      ║ ──────────────────────────── Mounting ║
//      ║ ╭────────╮ defaultProps               ║
//      ║ │ Parent │ state                      ║
//      ║ ╰────────╯                            ║
//      ║ ╭────────╮ componentWillMount         ║
//      ║ │ Parent │ render                     ║
//      ║ ╰───┬────╯                            ║
//      ║ ╭───┴───╮  componentWillMount         ║
//      ║ │ Child │  render                     ║
//      ║ ╰───────╯                             ║
//      ║ ───────────────────────────── Mounted ║
//      ║ ╭───────╮  componentDidMount          ║
//      ║ │ Child │  render                     ║
//      ║ ╰───┬───╯                             ║
//      ║ ╭───┴────╮ componentDidMount          ║
//      ║ │ Parent │ render                     ║
//      ║ ╰────────╯                            ║
//      ║ ──────────────────────────── Updating ║
//      ║ ╭────────╮   │ onChange               ║
//      ║ │ Parent ├ ← ┤ изменяет               ║
//      ║ ╰───┬────╯   │ состояние              ║
//      ║     ↓ new props                       ║
//      ║ ╭───┴───╮  componentWillReceiveProps  ║
//      ║ │ Child │  shouldComponentUpdate      ║
//      ║ ╰───────╯  componentWillUpdate        ║
//      ║            render                     ║
//      ║            componentDidUpdate         ║
//      ╚═══════════════════════════════════════╝
//      - Parent вызывает componentWillMount и ожидает монтирование Child
//      - Child завершает монтирование и вызывает componentDidMount
//      - Parent вызывает componentDidMount 
//      - обновление состояния Parent приводит к обновлению Child и выозву
//          ряда методов

// Монтирование - это процесс React, помещающий компоненты в фактическую DOM, 
//      до этого момента компонент существует только в виртуальной DOM. Во время 
//      монтирования следует выполнять операции извлечения данных, HTTP-вызовы, 
//      чтение cookie-файлов. На этом этапе можно получить доступ к DOM-элементу 
//      через функцию ref.

// Метод componentWillMount позволяет установить состояние или выполнить другие 
//      действия перед монтированием компонента, при этом изменения состояния 
//      не будут запускать повторный рендеринг, в отличие от других методов 
//      жизненного цикла.

// Метод componentDidMount вызывается когда компонент смонитрвоан и готов 
//      к обновлению. Этот метод позволяет получить доступ к состоянию и 
//      свойствам компонентов; сделать обновление данных, полученных через 
//      HTTP-запросы; выполнить изменения зависящие от DOM при помощи jQuery 
//      или других библиотек.

// --- 5.3 Методы обновления.

// Методы shouldComponentUpdate, componentWillUpdate, componentDidUpdate используются
//      для подключения к процессу обновления данных. Метод shouldComponentUpdate 
//      позволяет отменить обновление данных, для этого он должен вернуть false, 
//      тогда вызов метода render пропускается до следующего изменения состояния, а 
//      также не вызываются методы componentWillUpdate и componentDidUpdate.

// Функция shouldComponentUpdate может сравнивать старые свойства и состояние с новыми, 
//      чтобы отменить не нужные операции рендеринга. Этот способ оптимизации следует
//      применять в крайнем случае, поскольку React уже использует сложные алгоритмы
//      обновления данных.

// React монтирует компоненты рекурсивно, проходя по всей иерархии компонентов, 
//      и двигаясь от дочерних к родительским компонентам, то есть дочерние монтируются 
//      всегда перед родительскими.

// --- 5.4 Методы размонтирования.

//      ╔═══════════════════════════════════════════════════════════════════╗
//      ║  Unmounted компонент                                              ║
//      ║   существует только                                               ║
//      ║     в Virtual DOM                                                 ║
//      ║    ╭─────────────╮ ReactDOM.render           ╭──────────────╮     ║
//      ║    │ Virtual DOM ├──────────────────────── → ┤ constructor: │     ║
//      ║    ╰──────┬──────╯ ReactDOM.hydrate (SSR)    │ props, state │     ║
//      ║           ↑                                  ╰───────┬──────╯     ║
//      ║           ┊          setState не запускает ╭─────────┴──────────╮ ║
//      ║           ┊          повторный рендеринг   │ componentWillMount │ ║
//      ║           ┊                                ╰─────────┬──────────╯ ║
//      ║ ╭─────────┴──────────╮                     ╭─────────┴──────────╮ ║
//      ║ │ componentWillMount │                     │       render       │ ║
//      ║ ╰─────────┬──────────╯                     ╰─────────┬──────────╯ ║
//      ║           ↑          setState не запускает ╭─────────┴──────────╮ ║
//      ║           │          повторный рендеринг   │ componentDidMount  │ ║
//      ║           │                                ╰─────────┬──────────╯ ║
//      ║           │                                     ╭────┴────╮       ║
//      ║           ╰─────────────────────────────────────┤ Mounted │       ║
//      ║                 ReactDOM.unmountComponentAtMode ╰─────────╯       ║
//      ╠═══════════╗                        Mounted компонент существует в ║
//      ║ React DOM ║                        DOM и обновляется через React  ║
//      ╚═══════════╩═══════════════════════════════════════════════════════╝
//      - монтирование и размонтирование контролируются ReactDOM
//      - компонент контролирует обновление через shouldComponentUpdate

// Размонтирование - это процесс удаления компонента из DOM. При использовании роутера,
//      компоненты будут удаляться при перемещении по страницам. Метод componentWillUnmount 
//      должен выполнять любую очистку, необходимую для удаления компонента.

// --- 5.5 Перехват ошибок.

// В старых версиях React приложение блокировалось полностью при возникновении ошибки
//      в методах render или жизненного цикла, то есть неперехваченная ошибка могла
//      заблокировать работу всего приложения.

// В новых версиях React неперехваченное исключение генерируемое в конструкторе, 
//      методе render или методах жизненного цикла приводит к размонтированию компонента
//      и его потомков, что позволяет изолировать ошибки в компонентах.

// Неперехваченные исключения следует обрабатывать в методе componentDidCatch, который
//      предоставляет доступ к ошибке и сообщению об ошибке. Метод можно применять 
//      для настройки ошибок отдельных компонентов или на уровне приложения. 

// --- 5.6 Дочерний компонент.

// 
class ChildComponent extends Component {
    constructor(props) {
        console.log('ChildComponent : state');

        // 
        super(props);
        this.state = {
            name: 'Mark',
            isError: false
        };

        // 5.5 перехват ошибок
        this.createError = this.createError.bind(this);
    }

    // 5.5 перехват ошибок
    createError() {
        console.log('ChildComponent : createError');

        // переключение состояния для выдачи ошибки
        this.setState(() => ({ isError: true }));
    }

    //
    render() {
        console.log('ChildComponent : render');

        // 5.5 перехват ошибок
        if (this.state.isError) {
            throw new Error('Something went wrong');
        }

        // 
        return (
            <>
                <div key="name">{this.props.name}</div>
                <button key="error" onClick={this.createError}>Create error</button>
            </>
        );
    }

    // 5.2 методы монтирования

    // - позволяет управлять состоянием перед монтированием, это последний шанс 
    //      изменить исходные данные для рендеринга;
    // - вызывается однократно как с клиентской, так и с серверной стороны перед 
    //      началом рендеринга;
    componentWillMount() {
        // несколько вызовов setState в componentWillMount будут обрабатываться,
        //      как один, то есть render вызвана один раз
        console.log('ChildComponent : componentWillMount');
    }

    // - вызывается, как только компонент был помещен в DOM;
    // - предоставляет доступ к ссылкам, используется для интеграции библиотек 
    //      JavaScript, установки таймеров (setTimeout/setInterval) и отправки
    //      HTTP-запросов;
    // - вызывается однократно сразу после первоначального рендеринга, только 
    //      со стороны клиента, но не на сервере, вызывается сначала в дочерних 
    //      компонентах потом в родительских;
    componentDidMount() {
        console.log('ChildComponent : componentDidMount');
    }

    // 5.3 методы обновления

    // - доступ к старым свойствам можно получить через this.props;
    // - позволяет реагировать на передачу свойств перед вызовом render с помощью 
    //      setState, вызов setState внутри этой функции не вызовет дополнительный 
    //      рендеринг;
    // - вызывается, когда компонент получает новые свойства, не вызывается 
    //      для первоначального рендеринга;
    componentWillReceiveProps(nextProps) {
        console.log('ChildComponent : componentWillReceiveProps');
        console.log('nextProps: ', nextProps);
    }

    // 5.3 методы обновления

    // Порядок выполнения методов обновления: 
    //      shouldComponentUpdate, componentWillUpdate, componentDidUpdate.  

    // - если возвращает false, то функция render будет полностью пропущена 
    //      до следующего изменения состояния, в этом случае методы 
    //      componentWillUpdate и componentDidUpdate вызываться не будут;
    // - может использоваться как метод оптимизации, но с большой осторожностью;
    // - вызывается перед рендерингом, когда компонент принимает новые свойства или 
    //      состояние, не вызывается для первоначального рендеринга;
    shouldComponentUpdate(nextProps, nextState) {
        console.log('ChildComponent : shouldComponentUpdate');
        console.log('nextProps: ', nextProps);
        console.log('nextState: ', nextState);
        return true;
    }

    // - позволяет выполнить подготовку до того, как произойдет обновление, нельзя 
    //      применять функцию setState;
    // - вызывается непосредственно перед рендерингом при получении новых свойств или 
    //      состояния, не вызывается для первоначального рендеринга;
    componentWillUpdate(nextProps, nextState) {
        console.log('ChildComponent : componentWillUpdate');
        console.log('nextProps: ', nextProps);
        console.log('nextState: ', nextState);
    }

    // - позволяет работать с DOM элементом после его обновления;
    // - вызывается сразу после обновления компонента в DOM, не вызывается 
    //      для первоначального рендеринга;
    componentDidUpdate(previousProps, previousState) {
        console.log('ChildComponent : componentDidUpdate');
        console.log('previousProps: ', previousProps);
        console.log('previousState: ', previousState);
    }

    // 5.4 методы размонтирования

    // - позволяет выполнять любую необходимую очистку: обнуление таймеров, очистку 
    //      DOM элементов, созданных в componentDidMount;
    // - вызывается непосредственно перед размонтированием компонента;
    componentWillUnmount() {
        console.log('ChildComponent : componentWillUnmount');
    }
};

//
ChildComponent.propTypes = {
    name: PropTypes.string
};

// 5.1 установка свойства defaultProps
ChildComponent.defaultProps = (function () {
    console.log('ChildComponent : defaultProps');
    return {};
})();

// --- 5.7 Родительский компонент.

// 
class ParentComponent extends Component {
    constructor(props) {
        console.log('ParentComponent : constructor');

        // 5.1 установка state по умолчанию
        super(props);
        this.state = {
            text: ''
        }
        this.onInputChange = this.onInputChange.bind(this);
    }

    // родительский компонент прослушивает изменения в поле ввода и 
    //      предоставляет новые свойства дочернему через this.state
    onInputChange(e) {
        console.log('ParentComponent : onInputChange');
        this.setState({ text: e.target.value });
    }

    // 
    render() {
        console.log('ParentComponent : render');

        // 
        if (this.state.err) {
            return (
                <details style={{ whiteSpace: 'pre-wrap' }}>
                    <p>{this.state.error}</p>
                    <p>{this.state.errorInfo.componentStack}</p>
                </details>
            );
        }

        // 
        return (
            <>
                <h1>Rendering/Lifecycle.</h1>
                <div>
                    <h2 key="h2">Parent Component.</h2>
                    <input key="input" value={this.state.text}
                        onChange={this.onInputChange}
                    />
                </div>
                <div>
                    <h2 key="h2">Child Component.</h2>
                    <ChildComponent key="ChildComponent" name={this.state.text} />
                </div>
            </>
        );
    }

    // 5.2 методы монтирования
    componentWillMount() {
        console.log('ParentComponent : componentWillMount');
    }
    componentDidMount() {
        console.log('ParentComponent : componentDidMount');
    }

    // 5.4 методы размонтирования

    componentWillUnmount() {
        console.log('ParentComponent : componentWillUnmount');
    }

    // - обрабатывает ошибки в компонентах;
    // - React отключает компоненты в дереве ниже позиции, где произошла ошибка;
    // - вызывается при ошибке в конструкторе, в методах жизненного цикла или 
    //      при рендеринге;
    componentDidCatch(err, errorInfo) {
        console.log('ParentComponent : componentDidCatch');

        // 
        console.error(err);
        console.error(errorInfo);
        this.setState(() => ({ err, errorInfo }));
    }
}

// 
ParentComponent.defaultProps = (function () {
    console.log('ParentComponent : defaultProps');
    return {
        true: false
    };
})();

//
render(
    <ParentComponent />,
    document.getElementById('main-parent')
);