// react-enroute - альтернативный маршрутизатор React
//      https://www.npmjs.com/package/react-enroute

// path-to-regexp - параметризатор.
//      https://www.npmjs.com/package/path-to-regexp

// --------------- 11. Маршрутизация: кастомный роутер.

// Маршрутизация это система навигации по ресурсам. Для сервера это сопоставление
//      входных запросов с ресурсами сервера, например, баз данных. На клиенте
//      это сопоставление компонентов React и URL-адресов.

//      ╔══════════════════════════════════════════════════════════════════════════════════════════════╗
//      ║ ╭──────────────────────╮                                           ╭──────────────────╮      ║
//      ║ | Клиент в браузере:   | посылает запрос на сервер            ╭─ → ┤ 2. База данных   ├────╮ ║
//      ║ | - HTML, JS, CSS      ├───────────────────────────╮          |    | содержит данные  |    | ║
//      ║ | - каждый запрос      ├ ← ──────────────────────╮ |          |    ╰──────────────────╯    | ║
//      ║ |   обновляет страницу |    ответ клиенту        | |          |    ╭──────────────────╮    | ║
//      ║ ╰──────────────────────╯                         | |          ╰────┤ 1. Модель        ├ ← ─╯ ║
//      ║                                                  | ↓          ╭─ → ┤ обрабатывает     ├────╮ ║
//      ║   Дальнейшие запросы отправляют/получают     ╭───┴─┴───╮      |    | маршрут          |    | ║
//      ║     все представления данных и ресурсы       |         |      |    ╰──────────────────╯    | ║
//      ║ ──────────────────────────────────────────── | Сервер  ├ ← ─╮ |    ╭──────────────────╮    | ║
//      ║          Современная архитектура             |         |    | ╰─ → ┤                  ├ ← ─╯ ║
//      ║                                              ╰┬─┬───┬─┬╯    ╰─── → ┤ Контроллер       |      ║
//      ║ ╭────────────────────────╮ первый запрос      ↑ |   ↑ |       ╭─ → ┤                  ├────╮ ║
//      ║ | Клиент в браузере:     ├────────────────────╯ |   | |       |    ╰──────────────────╯    | ║
//      ║ | - HTML, JS, CSS        | ответ: HTML, JS, CSS |   | |       |    ╭──────────────────╮    | ║
//      ║ | - предаставления React ├ ← ───────────────────╯   | |       ╰────┤ 3. Представление ├ ← ─╯ ║
//      ║ | - данные отправляются  | второй запрос            | |            | ответ с HTML или |      ║
//      ║ |   через XHR/AJAX       ├──────────────────────────╯ |            | данными JSON     |      ║
//      ║ |                        | ответ: JSON                |            ╰──────────────────╯      ║
//      ║ |                        ├ ← ─────────────────────────╯                     ╔════════════════╣
//      ║ ╰────────────────────────╯                                                  ║ Клиент/сервер. ║
//      ╚═════════════════════════════════════════════════════════════════════════════╩════════════════╝
//      Сравнение устаревшей и современной архитектуры:
//      - в ответ на каждый запрос сервер извлекает данные из базы, заполняет 
//           HTML-представление и отправлет клиенту;
//      - в ответ на первый запрос сервер отправляет клиенту приложение React, 
//           последующие запросы выполняются через JavaScript для получение 
//           необходимых данных.

// --- 11.1 Запуск.

import React, { Children, cloneElement } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

// 
import enroute from 'enroute';

// Позволяет генерировать ошибки при не выполнении определенных условий. 
//      Если в функцию invariant передать ложное значение, то будет сгенерирована
//      ошибка с переданным сообщением. 
import invariant from 'invariant';

// navigate
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
const navigate = (to) => history.push(to);

// 
import colorData from "./../../data/colorData";

// 
import './../../styles/styles.scss';

// --- 11.2 Корневой компонент.

// Иерархия адресов:
//      http://localhost:3000
//          /about
//              /about
//              /about/services
//              /about/services/colors/:title
//          /dashboard
//          /no-match

// Иерархия компонентов:
//      Home
//          About
//              Services
//              Color
//          Dashboard
//      NoMatch

// 
function App() {
    // - Компонент Router обрабатывает компоненты Route.
    // - Компонент Route сопоставляет URL-адрес с компонентом.
    // - Компонент Link позволяет выполнять навигацию на стороне клиента.
    return (
        // Router сопоставляет маршруты с компонентами, указанными в дочерних
        //      компонентах Route
        <Router location={window.location.pathname}>
            {
                // компоненты могут вкладываться друг в друга
            }
            <Route path="/" component={Home} properties={{ x: "компонент Home", y: 1 }}>
                <Route path="about" component={About} properties={{ x: "компонент About", y: 2 }}>
                    {
                        // в маршруте можно указывать динамические параметры, 
                        //      которые будут доступны в компонентах
                    }
                    <Route path="services" component={Services} properties={{ x: "компонент Services", y: 3 }} />
                    <Route path="services/colors/:title" component={Color} properties={{ x: "компонент Color", y: 4 }} />
                </Route>
                <Route path="dashboard" component={Dashboard} />
            </Route>
            <Route path="*" component={NoMatch} />
        </Router>
    );
}

// --- 11.3 Компоненты.

// 
function Home({ children, setRenderLocation }) {
    return (
        <div>
            <h2>Home</h2>
            <nav>
                <p><Link setRenderLocation={setRenderLocation} to="/about">About</Link></p>
                <p><Link setRenderLocation={setRenderLocation} to="/about/services">Services</Link></p>
                <p><Link setRenderLocation={setRenderLocation} to="/dashboard">Dashboard</Link></p>
            </nav>
            <div>{children}</div>
        </div>
    );
}

// 
function About({ children, setRenderLocation }) {
    return (
        <div>
            <h2>About</h2>
            <nav>
                <p><Link setRenderLocation={setRenderLocation} to="/">Return.</Link></p>
            </nav>
            <div>{children}</div>
        </div>
    );
}

// 
function Dashboard({ setRenderLocation }) {
    return (
        <div>
            <h2>Dashboard</h2>
            <p><Link setRenderLocation={setRenderLocation} to="/">Return.</Link></p>
        </div>
    );
}

// 
function NoMatch({ setRenderLocation }) {
    return (
        <div>
            <h2>Not found.</h2>
            <p><Link setRenderLocation={setRenderLocation} to="/">Return.</Link></p>
        </div>
    );
}

// 
function Services({ setRenderLocation }) {
    return (
        <div>
            <h2>Services</h2>
            <p><Link setRenderLocation={setRenderLocation} to="/">Return.</Link></p>
            <p><Link setRenderLocation={setRenderLocation} to="/about/services/colors/Crimson">Crimson.</Link></p>
            <p><Link setRenderLocation={setRenderLocation} to="/about/services/colors/PaleGreen">PaleGreen.</Link></p>
            <p><Link setRenderLocation={setRenderLocation} to="/about/services/colors/Aquamarine">Aquamarine.</Link></p>
        </div>
    );
}

// 
function Color({ title }) {

    // объект params это объект, который содержит любые параметры маршрутизатора
    //let { title } = useParams();
    let color = colorData.colors.find(c => c.title === title);

    // 
    if (color) {
        return (<div style={{ backgroundColor: color.color, height: 100 }} />);
    }
    else {
        return (<div style={{ height: 100 }} >Not Found.</div>);
    }
}

// --- 11.4 Маршрутизатор Router.

// Маршрутизатор для сопоставления URL и параметризации маршрутов. 
//      React не имеет встроенной библиотеки маршрутизации.
//
//      // функция сопоставления
//
//      function edit_user(params, props) {
//          assert.equal(params.slug, 'matt');
//          assert.equal(props.additional, 'props');
//          return component(assign({}, params, props)); // Object.assign({}, params, props); // 
//      }
//
//      // создание экземпляра роутера, Enroute принимает объект с URL-адресами и 
//      //      функциями, которые вызываются при сопоставлении маршрутов
//
//      const router = Enroute({
//          '/users/new': create_user,
//          '/users/:slug': find_user,
//          '/users/:slug/edit': edit_user,
//          '*': not_found
//      });
// 
//      // сопоставить маршрут и получить компонент
//
//      let component = router('/users/matt/edit', { additional: 'props' });


// React.Children предоставляет функции для работы с this.props.children. 
//      Свойство доступно для компонентов и элементов React.

// - React.Children.map(children, function[(thisArg)])
//      вызывает функцию для каждого прямого потомка внутри children, возвращает 
//      массив элементов или null/undefined, если children равно null/undefined

// - React.Children.forEach(children, function[(thisArg)])
//      аналогичен React.Chidlren.map, но не возвращает массив

// - React.Children.count(children)
//      возвращает общее количество компонентов в children

// - React.Children.only(children)
//      возвращает единственного потомка из children или выдает ошибку

// - React.Children.toArray(children)
//      возвращает children как плоский массив с ключами, назначенными каждому потомку



// 
class Router extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            renderLocation: props.location,
        };

        // - хранилище, где ключ является маршрутом, а содержимое компонентом
        // - следует использовать this.state, чтобы менять маршруты динамически
        this.routes = {};

        // сборка маршрутов на основе дочерних компонентов в this.routes 
        this.addRoutes(props.children, null);

        //
        Object.keys(this.routes).forEach(key => {
            console.log('--- ' + key);
        });

        // создание роутера
        this.router = enroute(this.routes);
    }

    // используется для разрешения маршрутов
    addRoutes(childs, parent) {

        // - свойство children позволяет передавать компоненты другому компоненту 
        //      для компоновки или обращаться к потомкам изнутри компонента
        // - React.Children.forEach выполняет перебор дочерних элементов и 
        //      разрешение маршрутов дочерних компонентов
        // - React.Children.forEach проходит по дочерним компонентам с доступом
        //      к их свойствам, с помощью которых настраиваются маршруты и 
        //      определяются отображаемые компоненты.

        // Error: React.Children может быть как массивом так и объектом
        if (Array.isArray(childs)) {
            console.log(`--- Массив маршрутов`);

            // 
            React.Children.forEach(childs, (child) => {
                const { path } = child.props;
                console.log(`--- --- Свойство path: ${path}.`);
                this.addRoute(child, parent);
            });
        }
        else {
            console.log(`--- Один маршрут`);

            // 
            this.addRoute(childs, parent);
        }
    }

    // разрешение маршрутов, сопоставляет маршрут и компонент
    addRoute(element, parent) {
        const { component, path, children } = element.props;

        // валидация свойств
        invariant(component, `Компонент отсутствует.`);
        invariant(path, `Отсутствует свойство path.`);
        invariant(typeof path === 'string', `Свойство path задано не верно.`);

        // функция принимает параметры маршрута и дополнительные данные, после
        //      эта функция передается в роутер при создании экземпляра
        const render = (params, renderProps, renderChildren) => {

            let tmpProps = {
                // свойства корневого компонента
                //      ...this.props,
                // обнулить children чтобы не отображать компоненты Route
                children: renderChildren,
                // передать всем дочерним компонентам Router
                setRenderLocation: (to) => this.setState({ renderLocation: to }),
            };

            // объединяем свойства родительского и дочернего компонента
            let finalProps = Object.assign(
                // параметры маршрута
                params,
                // свойства компонента Router
                tmpProps,
                // свойства рендеринга enroute
                //      renderProps,
                // дополнительные свойства, которые указываются в Route
                element.props.properties ? element.props.properties : {}
            );

            // добавить аргумент header от элемента Route в финальные свойства 
            //
            //      if (element.props.header) {
            //          finalProps = Object.assign(finalProps, { header: element.props.header });
            //      }

            // создание компонента с передачей всех свойств
            const children = React.createElement(component, finalProps, renderChildren);

            // вызвать рендеринг родительского компонента с передачей созданных компонентов
            return parent ? parent.render(params, {}, children) : children;
        };

        // конкатенация адресов
        let route = parent ? `${parent.route}/${path}` : `/${path}`;

        // обработать дочерние компоненты
        if (children) {
            this.addRoutes(children, { route, render });
        }

        // коррекция маршрута
        route = route.replace(/\/+/g, '/');
        route = (route === '/*') ? '*' : route;
        this.routes[route] = render;
    }

    //
    render() {
        // проверка свойства location
        invariant(this.state.renderLocation, 'not found current location');
        // использовать маршрутизатор для сопоставления и возврата компонента
        return this.router(this.state.renderLocation);
    }
}

// компонент получает дочерние компоненты и базовый маршрут
Router.propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
    location: PropTypes.string.isRequired
};

// --- 11.5 Маршрут Route.

// компонент Route группирует маршрут и компонент
class Route extends React.Component {
    render() {
        // при вызове компонента всегда генерируется ошибка, поскольку компонент
        //      не должен ничего отображать:
        //      Error: Invariant Violation: Компонент Route не должен отображаться.
        return invariant(false, "Компонент Route не должен отображаться.");

        // тестовый вывод компонента Route
        return (<p>Route Error!</p>);
    }
}

// путь и компонент
Route.propTypes = {
    path: PropTypes.string,
    properties: PropTypes.object, // header: PropTypes.string, // 
    component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.node]),
};

// --- 11.6 Реализация Link: RouterLinkChild.

// 
//      <RouterLinkChild to="/First">
//          <button type="button">/First?chapter=Routing</button>
//      </RouterLinkChild>
// 
function RouterLinkChild({ to, children }) {
    return cloneElement(
        // выбрать одного потомка (элемент button) для клонирования
        Children.only(children),
        // onClick выполняет навигацию
        { onClick: () => navigate(to) }
    );
}

// 
RouterLinkChild.propTypes = {
    to: PropTypes.string,
    children: PropTypes.node
};

// --- 11.7 Реализация Link: RouterLink.

// 
//      <p><Link to="about">About</Link></p>
// 
function Link({ to, children, setRenderLocation }) {

    // 
    const onClick = () => {
        // заменить url в адресной строке браузера
        navigate(to);
        // загрузить новый маршрут через роутер
        setRenderLocation(to);
    };

    // 
    return (
        <button onClick={() => onClick()}>
            {children}
        </button>
    );
}

// 
Link.propTypes = {
    to: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.node]),
    setRenderLocation: PropTypes.func,
};

// 
render(<App />, document.getElementById('app'));