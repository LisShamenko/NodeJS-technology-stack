import React, { useReducer, useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, memo } from "react";
import { EventEmitter } from 'Events';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

import postsData from './../../data/postsData';
import Post from './components/Post';



// --------------- 6. Хуки.

// --- 6.1 Хук useEffect.

// Компонент - это функция, которая отображает пользовательский интерфейс. 
//      Рендеринг происходит при первой загрузке приложения и при изменении
//      свойств или состояния компонентов.

// 
function UseEffectForm() {

    // 
    const [text] = useState(false);
    const textRef = useRef();

    // alert блокирует рендеринг компонента
    alert(`--- alert блокирует рендеринг компонента ---`);

    // Хук useEffect - это функция, которая выполняется после рендеринга, что 
    //      предоставляет доступ к текущим значениям состояния компонента внутри 
    //      хука. Хук useEffect используется для создания побочных эффектов 
    //      после рендеринга. Побочный эффект - это код, который не возвращает 
    //      данных и его выполнение не связано с отображением пользовательского 
    //      интерфейса.

    // размещение alert внутри useEffect означает, что функция будет 
    //      вызываться после рендеринга в качестве побочного эффекта
    useEffect(() => {
        alert(`--- alert вызывается в качестве побочного эффекта ---`);
    });

    // запись в localStorage
    useEffect(() => {
        localStorage.setItem("text-value", text);
    });

    // - useEffect получает доступ к последним значениям отображения после
    //      рендеринга: props, state, refs; 
    // - установить фокус на вводе текста, который был добавлен в DOM
    useEffect(() => {
        if (!textRef) {
            return;
        }
        // useEffect получает доступ к значению ссылки textRef после
        //      рендеринга, чтобы выполнить фокусировку на элементе
        textRef.current.focus();
    });

    // 
    return (
        <div>
            <h2>ref</h2>
            <form>
                <input ref={textRef} type="text" placeholder="..." required />
            </form>
        </div>
    );
};

// хук useEffect и массив зависимостей
function UseEffectDependency() {

    // 
    const [first, setFirst] = useState("");
    const [second, setSecond] = useState("пример");
    const firstToSecond = () => {
        setSecond(first);
        setFirst("");
    };
    const secondToFirst = () => {
        setFirst(second);
        setSecond("");
    };

    // после каждого рендеринга вызываются оба хука useEffect
    useEffect(() => console.log(`first: ${first}`));
    useEffect(() => console.log(`second: ${second}`));

    // Хуки useEffect можно связать с изменениями данных, так чтобы
    //      эффекты не запускались при каждом рендеринге. Для управления 
    //      моментом вызова эффекта применяется массив зависимостей 
    //      во втором аргументе хука useEffect.

    // Разделение функциональности на несколько вызовов useEffect является 
    //      нормальной практикой.

    // вызывается только при изменении значения first
    useEffect(() => console.log(`вызывается при изменении first`), [first]);

    // вызывается только при изменении значения second
    useEffect(() => console.log(`вызывается при изменении second`), [second]);

    // вызывается при изменении двух значений first или second:
    useEffect(() => console.log(`вызывается при изменении first и second`), [first, second]);

    // если указать пустой массив зависимостей, то эффект будет вызван только 
    //      один раз после первого рендеринга, что является полезной функцией, 
    //      так как позволяет выполнить инициализацию
    useEffect(() => console.log("вызывается один раз после первого рендеринга"), []);

    // функция возвращаемая из эффекта будет вызываться при удалении компонента 
    //      из дерева, то есть хук можно использовать для настройки и разборки
    //      компонента
    useEffect(
        () => {
            console.log("вызывается при первом рендеринге");
            return () => console.log("вызывается после удаления компонента");
        },
        []
    );

    // 
    return (
        <div>
            <h2>dependency</h2>
            {
                // при изменении значения input вызывается set-функция, которая 
                //      обновляет переменную, что приводит к повторному рендерингу
            }
            <form>
                <p><label>First:
                    <input value={first} onChange={e => setFirst(e.target.value)} />
                </label></p>
                <p><label>Second:
                    <input value={second} onChange={e => setSecond(e.target.value)} />
                </label></p>
            </form>
            <button onClick={firstToSecond}>first to second</button>
            <button onClick={secondToFirst}>second to first</button>
        </div>
    );
}

//
render(
    <>
        <h1>Хук useEffect.</h1>
        <UseEffectForm />
        <UseEffectDependency />
    </>,
    document.getElementById('main-use-effect')
);

// --- 6.2 Хук useObserver.

// EventEmitter
//      https://nodejs.org/api/events.html#events_events
class PostCreator extends EventEmitter {
    constructor() {
        super();
        let i = 0;
        setInterval(() => {
            if (i < postsData.posts.length) {
                this.emit('add_post', postsData.posts[i].post);
                i++;
            }
        }, 1000);
    }
}

// пользовательский хук с подпиской на событие
const useObserver = (postCreator) => {

    // вернуть переменную состояния и функцию добавления
    const [posts, setPosts] = useState([]);

    //
    const addPost = post => setPosts(allPosts => [post, ...allPosts]);

    // использование подписки в хуке useEffect
    useEffect(() => {
        // вызывается при первом рендеринге
        postCreator.on('add_post', (post) => {
            addPost(post);
        });
        // вызывается при удалении компонента из дерева
        return () => postCreator.off('add_post', addPost);
    }, []);

    //
    return posts;
};

// применение хука
function PostsWall({ url }) {

    // 
    const postCreator = new PostCreator();
    const posts = useObserver(postCreator);

    // 
    return (
        <>
            {posts.map(post => <Post key={post.id} {...post} />)}
        </>
    );
}

//
render(
    <>
        <h1>Хук useObserver.</h1>
        <PostsWall />
    </>,
    document.getElementById('main-posts-wall')
);

// --- 6.3 Хук useCallRender.

// тестовый хук заставляет компонент рендериться при каждом нажатии клавиши
const useCallRender = () => {
    const [value, setValue] = useState();
    useEffect(() => {
        // для принудительного рендеринга достаточно вызвать функцию
        //      изменения состояния
        window.addEventListener('keydown', setValue);
        // функция очистки остановит прослушку события 'keydown'
        return () => window.removeEventListener('keydown', setValue);
    }, []);
};

// --- 6.3 Мемоизация.

// Мемоизация - в программировании сохранение результатов выполнения функций
//      для предотвращения повторных вычислений.

//
const external_words = ["foo", "bar", "baz"];

//
function DeepHook() {

    // принудительный рендеринг при нажатии клавиши
    useCallRender();

    // вызов useEffect при первом рендеринге и при изменении значения word
    const word = "foo";
    useEffect(() => console.log(`--- useEffect: изменение word`), [word]);

    // при каждом рендеринге создается новый массив words, что регистрируется
    //      как обновление, которое должно запускать рендеринг, то есть
    //      хук будет срабатывать при каждом рендеринге не зависимо от
    //      содержимого массива words
    const words = ["foo", "bar", "baz"];
    useEffect(() => console.log(`--- useEffect: изменение words`), [words]);

    // массив words должен быть объявлен за пределами компонента, в этом случае
    //      при рендеринге массив words остается тем же экземпляром, то есть
    //      хук не будет вызываться после первого рендеринга; переменную массива
    //      не всегда можно определять вне области видимости компонента;
    useEffect(() => console.log(`--- useEffect: изменение external_words`), [external_words]);

    //
    return (<h1>Deep hook.</h1>);
}

// без мемоизации
function WithoutMemoization({ textLine = "" }) {

    //
    useCallRender();

    // строка textLine парсится в массив слов words
    const words = textLine.split(" ");

    // хук будет вызываться при нажатии клавиши, а не только при изменении words,
    //      проблема та же, экземпляры массива words, создаваемые split, не равны
    useEffect(() => console.log(`--- useEffect: изменение words`), [words]);

    //
    return (<p>{words.length} - {textLine}</p>);
}

// 
function WithMemoization({ textLine = "" }) {

    //
    useCallRender();

    // --- 6.4 хук useMemo

    // Хук useMemo - это хук вызывает функцию вычисления мемоизированного значения,
    //      которое сохраняется и кешируется. При повторном вызове хука, если функция
    //      вызывается с теми же данными, то значение возвращается из кеша вместо
    //      повторного вычисления. Хук позволяет сравнивать кешированное значение
    //      с новым результатом.

    const words = useMemo(
        // вызывает переданную ему функцию и устанавливает words в значение,
        //      возвращаемое этой функцией, значение words помещается в кеш
        () => textLine.split(" "),
        // - если не добавить массив зависимостей, то массив words будет вычисляться
        //      при каждом рендеринге;
        // - массив зависимостей определяет, когда должна вызываться функция в первом
        //      аргументе, в данном случае это необходимо делать при изменении содержимого
        //      компонента, то есть свойства textLine;
        // - useMemo будет вычислять значение words при первом рендеринге и при изменении
        //      свойства textLine;
        [textLine]
    );

    //
    useEffect(() => console.log(`--- useEffect: изменение words`), [words]);

    // --- 6.5 хук useCallback

    // Хук useCallback - аналогичен useMemo, но используется для кеширования функций.
    //      Он запоминает значение функции fn и ожидает массив зависимостей.

    // fn - это функция, которая становится зависимостью для хука useEffect, без мемоизации
    //      при каждом рендеринге будет создаваться новый экземпляр функции, что приведет
    //      к срабатыванию хука useEffect

    const fn_1 = () => 'first function';
    useEffect(() => console.log(`--- useEffect: зависимость от функции (${fn_1()})`), [fn_1]);

    const fn_2 = useCallback(() => 'second function', []);
    useEffect(() => console.log(`--- useEffect: зависимость от функции (${fn_2()})`), [fn_2]);

    //
    return (<p>{words.length} - {textLine}</p>);
}

//
render(
    <>
        <h1>Хуки useMemo и useCallback.</h1>
        <DeepHook />
        <WithoutMemoization textLine="The EventEmitter class is defined and exposed by the events module." />
        <WithMemoization textLine="Adds the listener function to the end of the listeners array for the event named eventName." />
    </>,
    document.getElementById('main-memoization')
);

// --- 6.6 Хук useMemoization.

// хук с мемоизацией массива
const useMemoization = (postCreator) => {

    // получить состояние posts
    const [posts, setPosts] = useState([]);
    const addPost = post => setPosts(allPosts => [post, ...allPosts]);

    // - функция '() => posts' возвращает значение posts;
    // - если состояние posts меняется, то вызывается useMemo;
    // - useMemo кеширует значение posts и сравнивает с результатом вызова
    //      функции '() => posts', если они равны, то возвращает тот же
    //      экземпляр массива posts из кеша
    const memoPosts = useMemo(() => posts, [posts]);

    // хук useEffect срабатывает если новое значение posts вернется не из кеша,
    //      а будет получено заново
    useEffect(() => console.log(`--- массив posts: ${memoPosts}`), [memoPosts]);

    // подписка на newsFeed, что обеспечивает обновление состояния posts
    useEffect(() => {
        postCreator.on('add_post', addPost);
        return () => postCreator.off('add_post', addPost);
    }, []);

    //
    return memoPosts;
};

// --- 6.7 Хук useLayoutEffect.

// Хук useLayoutEffect - вызывается между рендерингом компонентов React и
//      отрисовкой DOM в браузере. Последовательность событий:
//      1. Рендеринг.
//      2. Вызов useLayoutEffect.
//      3. Отрисовка браузера: элементы добавляются в DOM.
//      4. Вызов useEffect.

// тестовый хук для отслеживания размеров элемента
function useWindowSize() {

    // Ширина и высота окна может понадобиться компоненту перед отрисовкой DOM
    //      в браузере. Хук useLayoutEffect используется для вычисления ширины и
    //      высоты окна перед отображением.

    // состояние для ширины и высоты элемента
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // хук useLayoutEffect вычисляет ширину и высоту окна перед отображением
    const resize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    // useLayoutEffect вызывается после рендеринга и до отображения изменений
    //      браузером, если эффект важен для отрисовки браузера, то следует
    //      использовать LayoutEffect
    useLayoutEffect(() => {
        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
    }, []);

    //
    return { width, height };
};

// тестовый хук для отслеживания позиции мыши
function useMousePosition() {

    //
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    //
    const setPosition = ({ x, y }) => {
        setX(x);
        setY(y);
    };

    //
    useLayoutEffect(() => {
        window.addEventListener("mousemove", setPosition);
        return () => window.removeEventListener("mousemove", setPosition);
    }, []);

    //
    return { x, y };
};

// последовательность событий
function UseHooks() {

    //Warning: unstable_flushDiscreteUpdates: Cannot flush updates when React is already rendering. at UseHooks (webpack://technology_nodejs/./ReactTechno/Chapters/Hooks/index.js?:523:19)

    //
    const postCreator = new PostCreator();
    let memoPosts = useMemoization(postCreator);
    useEffect(() => console.log(`
        --- вызов хука useMemoization
        --- массив posts: ${memoPosts}
    `), [memoPosts]);

    //
    let { width, height } = useWindowSize();
    useEffect(() => console.log(`
        --- вызов хука useWindowSize
        --- width = ${width}, height = ${height}
    `), [width, height]);

    //
    let { x, y } = useMousePosition();
    useEffect(() => console.log(`
        --- вызов хука useMousePosition
        --- x = ${x}, y = ${y}
    `), [x, y]);

    //
    useEffect(() => console.log(`--- вызов хука useEffect`));

    //
    useLayoutEffect(() => console.log(`--- вызов хука useLayoutEffect`));

    //
    return (<h1>Хуки.</h1>);
}

//
render(
    <>
        <h1>Хуки: useMemoization, useWindowSize, useMousePosition, useLayoutEffect.</h1>
        <UseHooks />
    </>,
    document.getElementById('main-layout')
);

// --- 6.8 Правила работы с хуками

// Модуль eslint-plugin-react-hooks позволяет отслеживать нарушения перечисленных
//      ниже правил.

// 1. Хуки можно вызывать в компонентах React или в пользовательских хуках,
//      которые так же используются только в компонентах. Хуки не являются
//      обычным средством JavaScript, это паттерн React.

// 2. Рекомендуется делить функциональность на небольшие хуки. Хуки вызываются
//      по порядку и после вызова React сохраняет значения хуков в массив, чтобы
//      затем их отслеживать. Порядок вызова хуков не зависит от рендеринга и
//      всегда остается одним и тем же.

// 3. Хуки не могут быть вложены в локальную область видимости, то есть
//      в условные операторы, циклы или вложенные функции.

// 4. Асинхронное поведение нужно описывать внутри хука, поскольку хуки принимают
//      функцию в качестве первого аргумента, а не promise.

function Rules() {

    // Порядок вызова хуков не зависит от рендеринга и не должен зависеть от
    //      условной логики, поскольку для React важен индекс эффекта в массиве.
    //      Значения хранятся в массиве:
    //      [first, second, DependencyArray]

    const [first, setFirst] = useState(100);

    // если используется условная логика, то массив хуков может меняться:
    //      [first, DependencyArray]
    if (first > 1000) {
        const [second, setSecond] = useState(200);
    }

    // поэтому условные операторы, циклы и вложенные функции должны вкладываться
    //      в хуки, а не наоборот, массив хуков:
    //      [countValue, checkedValue, DependencyArray]
    const [second, setSecond] = useState(
        first => (first < 1000) ? 500 : 1500
    );

    //
    function getPromise() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve('foo'), 1000);
        });
    }

    // асинхронный хук
    useEffect(
        () => {
            // асинхронная функция обрабатывается через async и await
            const fn = (async () => await getPromise());
            fn();
            // самовызывающаяся функция
            (async () => await getPromise())();
        },
        [second]
    );

    //
    return (<p>--- first: {first} --- second: {second}</p>);
}

//
render(
    <>
        <h1>Правила работы с хуками.</h1>
        <Rules />
    </>,
    document.getElementById('main-rules')
);

// --- 6.9 Хук useReducer.

// редукторы
function Reducers() {

    // переменная состояния checked и set-функция setChecked для обновления
    //      состояния; при первом рендеринге значение checked будет равно false
    const [checked, setChecked] = useState(false);

    // вызывает setChecked и обновляет значение checked на противоположное
    function toggle() {
        setChecked(checked => !checked);
    }

    // Функция 'checked => !checked' называется редуктором. Если checked равно
    //      true, то функция вернет false. Редуктор - это функция, которая
    //      принимает текущее состояние и возвращает новое.

    // Хук useReducer - принимает функцию-редуктор, исходное состояние и
    //      возвращает одно единственное вычисленное значение. Работа этогоа
    //      хука схожа с методом Array.reduce. Функция-редуктор должна быть
    //      чистой функцией.

    // Функция Array.reduce принимает редуктор и начальное значение. Редуктор
    //      вызывается для каждого элемента массива до получения одного
    //      результирующего значения.
    console.log(`--- 15 = ${[1, 2, 3, 4, 5].reduce((s, n) => n + s, 0)}`);

    //
    const [checkRed, toggleRed] = useReducer(checkRed => !checkRed, false);

    // функция-редуктор может принимать несколько аргументов
    const [number, setNumber] = useReducer((s, n) => n + s, 0);

    //
    return (
        <div>
            <h2>Редукторы.</h2>
            <div>
                {checked ? "checked" : "not checked"}
                <input type="checkbox" value={checked}
                    // данная версия выглядит сложно
                    onChange={() => setChecked(checked => !checked)}
                />
                <input type="checkbox" value={checked}
                    // onChange имеет предсказуемое значение в виде функции toggle
                    onChange={toggle}
                />
            </div>
            <div>
                {checkRed ? "checked reducer" : "not checked reducer"}
                <input type="checkbox" value={checkRed}
                    //
                    onChange={toggleRed}
                />
            </div>
            <button onClick={() => setNumber(30)}>Number: {number}.</button>
        </div>
    );
}

// данные
const initUser = { id: "0", name: "(пользователь 0)", isAdmin: false };

// компонент User
function User() {

    //
    const [user, setUser] = useState(initUser);

    // использовать хук useReducer для создания удобного обработчика onClick,
    //      что полезно, если состояние является объектом или следующее состояние
    //      зависит от предыдущего
    const [userRed, setUserRed] = useReducer(
        (user, newDetails) => ({ ...user, ...newDetails }),
        initUser
    );

    //
    return (
        <div>
            <h2>{user.name} - {user.isAdmin ? "Администратор" : "Пользователь"}</h2>
            {
                // ошибка управления состоянием
                <button
                    // начальное состояние initUser будет изменено на объект
                    //      '{ admin: true }'
                    onClick={() => { setUser({ isAdmin: true }); }} >
                    Затирает свойство user.
                </button>
            }
            {
                // исправление ошибки
                <button
                    // оператор spread записывает все данные состояния в новый объект,
                    //      после чего поле admin затирается новым значением
                    onClick={() => { setUser({ ...user, isAdmin: !user.isAdmin }); }}>
                    Spread без затирания.
                </button>
            }
            <h2>{userRed.name} - {userRed.isAdmin ? "Администратор" : "Пользователь"}</h2>
            <button
                // использовать редуктор для обработчика onClick
                onClick={() => { setUserRed({ isAdmin: true }); }}>
                Администратор
            </button>
        </div>
    );
}

// В прошлых версиях React для обновления состояния используется функция setState.
//      Инициализация состояния выполняется в конструкторе. Чтобы использовать
//      старый стиль существует пакет 'legacy-set-state'.

// компонент устаревший User
class UserLegacy extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: "1", name: "(пользователь 1)", isAdmin: false };
    }
    render() {
        return (
            <button onSubmit={() => { this.setState({ admin: true }); }}>
                Администратор
            </button>
        );
    }
}

//
render(
    <div>
        <h1>Хук useReducer.</h1>
        <Reducers />
        <User />
        <UserLegacy />
    </div>,
    document.getElementById('main-reducers')
);

// --- 6.10 Оптимизация.

// Оптимизация в React заключается в устранении лишних элементов и сокращении
//      времени рендеринга. Этого позволяют добиться функция memo, хуки useMemo и
//      useCallback.

// Частое использование хуков useCallback и useMemo может снизить производительность.
//      Для измерения производительности можно использовать React Profiler, который
//      входит в React Development Tools.

// Функция memo используется для создания чистых компонентов. Чистый компонент - это
//      компонент, который при одних и тех же свойствах всегда отображает один и тот
//      же вывод.

// тестовый компонент
const Term = ({ name }) => (<p>{name}</p>);

// Функция memo создает компонент, который будет отображаться только при изменении
//      его свойств. В функцию можно передать предикат в качестве второго аргумента,
//      который определяет нужно ли повторно рендерить компонент. Если предикат
//      возвращает false, то компонент рендерится повторно.
const PureTerm = memo(Term, (prev, next) => prev.name === next.name);

// Если в memo передать функцию, то компонент будет рендерится всегда, даже если name
//      не меняется. Это будет происходить, потому что функция, передаваемая в компонент,
//      всегда будет новым экземпляром объекта.
const TermClick = memo(
    ({ name, log = (f => f) }) => {
        return <p onClick={() => log(name)}>{name}</p>;
    }
);

//
function AppTerms() {

    //
    const [terms, setTerms] = useState(["foo", "bar", "baz"]);

    // хуки useCallback и useMemo можно использовать для запоминания
    //      свойств объектов и функций
    const callLog = useCallback(name => console.log(`--- Термин: ${name}`, []));

    //
    return (
        <div>
            <h1>Оптимизация.</h1>
            <button onClick={() => setTerms([...terms, prompt("--- Термин: ")])}>
                Добавить
            </button>
            {
                // простой компонент
                terms.map((name, i) => <Term key={i} name={name} />)
            }
            <hr />
            {
                // чистый компонент
                terms.map((name, i) => <PureTerm key={i} name={name} />)
            }
            <hr />
            {
                // передача обработчика log вызывает повторный рендеринг компонента
                terms.map((name, i) =>
                    <TermClick key={i} name={name}
                        log={name => console.log(`--- Термин: ${name}`)}
                    />
                )
            }
            <hr />
            {
                // вместо предиката проверки свойств, используется useCallback,
                //      проверяющий, что функция log не изменилась
                <TermClick name="foo-bar-baz" log={callLog} />
            }
        </div>
    );
}

//
render(<AppTerms />, document.getElementById('main-optimization'));