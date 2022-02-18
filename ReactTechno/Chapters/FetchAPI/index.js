import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { render } from "react-dom";
import fetch from 'isomorphic-fetch';

// react-window - предоставляет компоненты, которые могут отображать 
//      виртуальные списки. 
import { FixedSizeList } from "react-window";

// react-showdown - пакет, содержит компонент MarkdownView для отображения 
//      файлом MD.
import MarkdownView from 'react-showdown';

//
import virtualData from './../../data/virtualData';

// 
const startLogin = 'LisShamenko';
const startRepository = 'NodeJS-technology-stack';

// --------------- 9. Fetch API.

// --- 9.1 API GitHub.

// Информация об учетных записях пользователей:
//      https://api.github.com/users/${login}

// GitHub позволяет создавать персональный токен с заданными правилами чтения и 
//      записи: Settings > Developer > Settings > Personal Access Tokens.
//      Отправка токена с запросом выборки пользователей предоставит информацию
//      учетной записи.

// Чтобы получить содержимое файла README из GitHub репозитория следует выполнить
//      два запроса: 
//      - запросить url для получения файла README:
//          `https://api.github.com/repos/${login}/${repository}/readme`
//      - полученный url используется для загрузки файла README.

// --- 9.2 Запросы.

// Функция fetch позволяет делать HTTP-запросы из браузерного кода. Она 
//      делает асинхронный запрос к заданному URL и возвращает promise. 
function request_Promise() {
    fetch(`https://api.github.com/users/${startLogin}`)
        // API GitHub отвечает данными JSON, которые содержаться в теле запроса HTTP
        .then(response => response.json())
        // вывод полученных данных в консоль
        .then(console.log)
        // вывод ошибки
        .catch(console.error);
}

// используется механизм async/await для обработки promise возвращаемого fetch
async function request_AsyncAwait() {
    try {
        const response = await fetch(`https://api.github.com/users/${startLogin}`)
        const userData = await response.json();
        console.log(userData);
    } catch (error) {
        console.error(error);
    }
}

// Функция fetch позволяет отправлять данные в HTTP-запросе через второй 
//      аргумент функции. Для отправки следует использовать метод POST 
//      для создания данных и PUT для изменения данных.
//
//      fetch("/create/user", {
//          method: "POST",
//          // данные
//          body: JSON.stringify({ name })
//      });

// Для загрузки файлов используется HTTP-запрос типа 'multipart/form-data',
//      который указывает серверу, что в теле запроса передается файл.
function request_FormData() {

    // FormData - объект HTML-формы.
    //      https://developer.mozilla.org/ru/docs/Web/API/FormData/FormData
    const formData = new FormData();
    formData.append("data", "data");
    fetch("<URL>", {
        method: "POST",
        body: formData
    });
}

// Авторизованный запрос - это запрос в котором пользователь идентифицирует
//      себя в запросе при помощи уникального токена, который используется
//      сервером для идентификации. Пользователь получает токен при входе 
//      в систему или используя протокол OAuth сторонних серверов авторизации.
function request_Token() {
    fetch(`https://api.github.com/users/${startLogin}`, {
        method: "GET",
        headers: {
            // заголовок Authorization с токеном
            Authorization: `Bearer ${token}`
        }
    });
}

// --- 9.3 Локальные данные.

// Web Storage API позволяет сохранять данные локально в браузере:
// - объект window.localStorage хранит данные до удаления;
// - объект window.sessionStorage сохраняет данные сеанса, которые 
//      удаляются при закрытии вкладок или перезапуске браузера;
// - функция localStorage.clear выполняет очистку хранилища.

// Storage.getItem используется для загрузки данных с помощью ключа. 
//      const loadJSON = (key) => key && JSON.parse(localStorage.getItem(key));
function loadJSON(key) {
    if (key) {
        let item = localStorage.getItem(key);
        let result = JSON.parse(item);
        console.log(`--- loadJSON --- key:${key} --- result:${result}`);
        return result;
    }
    return null;
}

// Storage.setItem используется для сохранения данных в браузере.
//      const saveJSON = (key, data) => localStorage.setItem(key, JSON.stringify(data));
function saveJSON(key, data) {
    if (key) {
        let result = JSON.stringify(data);
        localStorage.setItem(key, result);
        console.log(`--- saveJSON --- key:${key} --- result:${result}`);
    }
}

// Функции loadJSON и saveJSON являются синхронными, поэтому могут вызвать
//      проблемы с производительностью, если вызывать их слишком часто и 
//      с большим объемом данных.

// Компонент использует localStorage для сохранения данных в браузере.
//      При первом рендеринге создается переменная состояния data с помощью 
//      хука useState. В состояние data будут записываться данные после 
//      завершения запроса fetch.
function ComponentLocalStorage({ login }) {

    // начальная установка состояния за счет данных из браузера,
    //      если данные уже есть в хранилище, то они будут записаны
    //      в состояние, иначе будет записан null
    const [data, setData] = useState(loadJSON(login));

    // используется для сохранения данных в браузере, когда изменяется 
    //      состояние data
    useEffect(
        () => {
            if (!data || data.login !== login) {
                return;
            }
            // 
            let { name, avatar_url, location } = data;
            saveJSON(login, { login, name, avatar_url, location });
        },
        [data]
    );

    // хук useEffect выполняет запрос данных из GitHub, если данные еще 
    //      не были сохранены
    useEffect(() => {
        if (!login || (data && data.login !== login)) {
            return;
        }
        // HTTP-запрос получает результат в формате JSON и
        //      записывает в переменную состояния
        fetch(`https://api.github.com/users/${login}`)
            .then(response => response.json())
            .then(setData)
            .catch(console.error);
    }, [login]);

    // 
    if (!data) {
        return null;
    }

    // JSON.stringify принимает три аргумента: 
    // - данные JSON для преобразования в строку; 
    // - функция для замены свойств объекта JSON; 
    // - количество пробелов, используемых при форматировании данных.
    return (<pre>{JSON.stringify(data, null, 2)}</pre>);
}

// Локальное хранилище с одной стороны может усложнить работу приложения, но 
//      с другой повысить производительность за счет сокращения числа сетевых
//      запросов. Не слудет использовать хранилище для кеширования данных, 
//      поскольку можно подключить HTTP кеширование. 

// Браузер будет автоматически кэшировать контент, если добавить заголовок 
//      'Cache-Control: max-age=<EXP_DATE>', где <EXP_DATE> определяет дату 
//      истечения срока действия контента.

// --- 9.4 Обработка промисов. 

// 
function ComponentPromise({ login }) {

    // 
    const [data, setData] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(true);

    //
    useEffect(
        () => {
            if (!login) return;
            setLoading(true);

            // Объект promise имеет три состояния: ожидание, выполнен и отклонен. Успешное 
            //      подключение к серверу и получение данных означает, что промис выполнен,
            //      иначе он будет отклонён. В production ошибка может быть записана 
            //      в журнал или выполнен повторный запрос.

            // Все промисы имеют три состояния обработки, что позволяет обрабатывать 
            //      все HTTP-запросы с помощью хука, компонента или даже функции Suspense.

            fetch(`https://api.github.com/users/${login}`)
                .then(data => data.json())
                .then(setData)
                .then(() => setLoading(false))
                .catch(setError);
        },
        [login]
    );

    // 
    if (loading) return (<h1>loading...</h1>);
    if (error) return (<pre>{JSON.stringify(error, null, 2)}</pre>);
    if (!data) return null;

    // 
    return (
        <div>
            <h2>{data.login}</h2>
            <img src={data.avatar_url} style={{ width: 50, height: 50 }} />
            <p>data.name: {data.name}</p>
            <p>data.location: {data.location}</p>
        </div>
    );
}

// --- 9.5 Render props.

// Render props - это компоненты, которые передаются как свойства в другие 
//      компоненты и отображаются при определенных условиях; или функции, 
//      которые возвращают отображаемые компоненты и могут использовать
//      данные из аргументов для рендеринга этих компонентов.

// компонент используется для отображения неупорядоченного списка, где
//      data - это массив элементов, которые нужно отобразить, 
//             по умолчанию пустой массив;
//      renderEmpty - это компонент, который будет отображаться, 
//             если список пуст.
function List({ data = [], renderItem, renderEmpty }) {

    // renderEmpty содержит компонент для рендеринга при выполнении заданного 
    //      условия и является 'render props'

    // использовать 'render props' renderEmpty, чтобы показать сообщение 
    //      пользователю, если список пуст
    if (!data.length) {
        return renderEmpty;
    }

    //  использовать 'render props' renderItem для отображения отдельных
    //      элементов списка
    return (
        <ul>
            {data.map((item, i) => (
                <li key={i}>{renderItem(item)}</li>
            ))}
        </ul>
    );
}

// 
function ComponentRenderProps({ users = [] }) {
    return (
        <List
            // отображаемый массив
            data={users}
            // 'render props' для отображения Empty
            renderEmpty={<p>Empty.</p>}
            // 'render props' для отображения элемента массива
            renderItem={item => (<p>{item.name}</p>)}
        />
    );
}

// --- 9.6 Виртуальные списки.

// Виртуализация - это метод отображения, позволяющий прокручивать списки 
//      любой длины. При прокрутки страницы, элементы страницы выходящие 
//      за переделы экрана удаляются из рендеринга, с противоположной стороны 
//      списка в рендеринг добавляются новые элементы.

// Пакеты react-window и react-virtualized позволяет создавать виртуальные
//      списки. React Native содержит встроенный компонент FlatList.

// компонент отобразит все элементы списка
//      <List data={virtualData} renderItem={(item) => (<p>{item.name}</p>)} />
function ComponentAllItems() {
    return (
        <div>
            <h3>Обычный список отобразит все элементы.</h3>
            {virtualData.map((item, i) => (
                <span key={i}>{item.name}</span>
            ))}
        </div>
    );
}

// альтернатива использованию компонента List
function ComponentVirtualList() {

    // код создает элемент div для каждого пользователя
    const renderRow = ({ index, style }) => (
        // пример быстрого 'display: "flex"'
        <div style={{ ...style, ...{ display: "flex" } }}>
            <img
                style={{ padding: 5, width: 50, height: 50 }}
                src={virtualData[index].avatar}
            />
            <p style={{ padding: 5 }}>name = {virtualData[index].name}</p>
            <p style={{ padding: 5 }}>email = {virtualData[index].email}</p>
        </div>
    );

    // 
    return (
        <div>
            <h3>Виртуальный список.</h3>
            <FixedSizeList height={300} width={500}
                // Компоненту FixedSizeList требуется количество элементов в списке и 
                //      количество пикселов на строку. 
                itemCount={virtualData.length} itemSize={100}>
                {
                    // 'render props' передается в FixedSizeList как свойство children
                    renderRow
                }
            </FixedSizeList >
        </div>
    );
}

// --- 9.7 Хук useMountedRef.

// Изменение состояния отключенного компонента вызывает ошибку. Чтобы этого 
//      избежать следует использовать хук, который определяет отключен компонент
//      или нет. 
function useMountedRef() {

    // когда компонент отключается, состояние очищается, но ссылки остаются доступными
    const mounted = useRef(false);

    // - хук не имеет зависимостей и вызывается при каждом рендеринге, что гарантирует
    //      значение ссылки равное true
    // - но при отключении компонента вызывается функция, которая сбрасывает значение
    //      ссылки в false
    useEffect(() => {
        mounted.current = true;
        return () => (mounted.current = false);
    });

    // 
    return mounted;
}

// --- 9.8 Хук Fetch.

// хук позволяет объединить логику выполнения запроса
function useFetch(url) {

    // три состояния запроса для promise
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [error, setError] = useState();

    // HTTP-запрос продолжает выполняться и возвращает ответ, но 
    //      состояние обновляется если компонент не отключен:
    //      - свойство mounted.current равно true, если компонент 
    //        не отключен
    //      - свойство mounted.current равно false, если компонент
    //        был отключен
    const mounted = useMountedRef();

    // 
    useEffect(
        () => {

            // при отсутствии url запрос не выполняется
            if (!url) {
                return;
            }

            // если компонент отключен, то не выполнять новых запросов
            if (!mounted.current) {
                return;
            }

            // запрос на выборку
            setLoading(true);
            fetch(url)
                .then(data => {
                    // если компонент был отключен после отправки запроса и перед 
                    //      получением данных, то генерируется ошибка, предотвращая 
                    //      дальнейшую обработку
                    if (!mounted.current) {
                        throw new Error("component is not mounted");
                    }
                    // иначе данные обрабатываются дальше
                    return data;
                })
                .then(data => data.json())
                // записываем данные, если запрос выполняется успешно
                .then(setData)
                // после загрузки флаг ожидания сбрасывается в false
                .then(() => setLoading(false))
                // в случае ошибки устанавливается ошибка
                .catch(error => {
                    // если компонент отключен, то ошибка игнорируется
                    if (!mounted.current) {
                        return;
                    }
                    // иначе можно установить переменую состояния error
                    setError(error);
                });
        },
        // хук вызывается при изменении значения url
        [url]
    );

    // 
    return { loading, data, error };
}

// 
function ComponentUsingHookFetch({ login }) {

    // 
    const { loading, data, error } = useFetch(
        `https://api.github.com/users/${login}`
    );

    // 
    if (loading) return (<p>...</p>);
    if (error) return (<pre>{JSON.stringify(error, null, 2)}</pre>);
    return (<pre>{JSON.stringify(data, null, 2)}</pre>);
}

// --- 9.9 Компонент Fetch.

// Хук useFetch абстрагирует механику выполнения HTTP-запроса. Компонент 
//      Fetch абстрагирует механику рендеринга результата запроса. 
//      Но большое количество уровней абстракции может усложнить код,
//      в то время, как главная задача снизить сложность

// компонент обрабатывает запрос useFetch и отображает результаты запроса
function ComponentFetch(
    {
        url,
        loadingFallback = (<p>...</p>),
        renderError = (error) => (<pre>{JSON.stringify(error, null, 2)}</pre>),
        renderSuccess = ({ data }) => (<pre>{data.login}</pre>),
    }
) {
    const { loading, data, error } = useFetch(url);

    // 
    if (loading) return loadingFallback;
    if (error) return renderError(error);
    if (data) return renderSuccess({ data });
}

// --- 9.10 Множественные запросы.

// Для получения всех необходимых данных требуется выполнять несколько
//      HTTP-запросов. Требуется выполнить два HTTP-запроса: 
// - запрос учетной записи пользователя;
// - запрос списка репозиториев пользователя.

// Хук перебора массивов, с учетом использования useCallback и useMemo.
const useIterator = (items = [], startIndex = 0) => {

    // Хук принимает массив и начальный индекс. Возвращает текущий элемент и 
    //      функции для итерации по массиву. Индекс идентифицирует текущий 
    //      элемент в массиве.  Функция setIndex вызывает повторный рендеринг 
    //      хука с новым индексом.

    // индекс создается с помощью хука useState
    const [index, setIndex] = useState(startIndex);

    // prev и next создаются с помощью хука useCallback, это гарантирует,
    //      что prev и next будут указывать на одни и теже экземпляры 
    //      функций, пока не изменится индекс

    // перейти к предыдущему индексу
    const prev = useCallback(() => {
        if (index === 0) return setIndex(items.length - 1);
        setIndex(index - 1);
    }, [index]);

    // перейти к следующему индексу
    const next = useCallback(() => {
        if (index === items.length - 1) return setIndex(0);
        setIndex(index + 1);
    }, [index]);

    // item будет указывать на один и тот же объект, пока не изменится индекс
    const item = useMemo(() => items[index], [index]);

    // 
    return [item || items[0], prev, next];
};

// отображение списка репозиториев
function ComponentRepositories(
    {
        login,
        repositories,
        selected,
        onSelect = f => f
    }
) {

    // - имена prev и next меняются на previous и next при помощи
    //      деструктуризации массива; 
    // - хук useIterator позволяет циклически перемещаться по списку 
    //      репозиториев;
    const [{ name }, previous, next] = useIterator(
        repositories,
        // начальный индекс, поиск индекса выполняется по имени в аргументе selected, 
        //      если был выбран репозиторий, иначе аозвращается null
        selected ? repositories.findIndex(repository => repository.name === selected) : null
    );

    // при изменении состояния name вызывается функция onSelect,
    //      которая выбирает новый репозиторий
    useEffect(() => {
        if (!name) return;
        onSelect(name);
    }, [name]);

    //
    const [show, setShow] = useState(false);

    // 
    return (
        <div>
            <p><label>
                <input type="checkbox" value={show} onChange={() => setShow(!show)} />
                {name}
            </label></p>
            <button onClick={previous}>previous</button>
            <button onClick={next}>next</button>
            {show && (
                <ComponentLoadReadme login={login} repository={name} />
            )}
        </div>
    );
}

// выполняет запрос репозиториев и отображение списка 
function ComponentUsingComponentRepositories(
    {
        login,
        selected,
        onSelect = f => f,
    }
) {
    return (
        <ComponentFetch
            // login используется для создания свойства url
            url={`https://api.github.com/users/${login}/repos`}
            // после успешного запроса будет отображен список репозиториев
            renderSuccess={({ data }) => (
                // информация о репозиториях пользователя передается в виде 
                //      массива объектов
                <ComponentRepositories
                    login={login}
                    repositories={data}
                    selected={selected}
                    onSelect={onSelect}
                />
            )}
        />
    );
}

// --- 9.11 Каскадные запросы.

// Каскадные запросы - это запросы, которые зависят друг от друга и выполняются 
//      последовательно.

// Для получения файла README из репозитория необходимо выполнить следующие запросы:
//      - запрос данных пользователя
//          https://api.github.com/users/${login};
//      - запрос репозиториев пользователя
//          https://api.github.com/users/${login}/repos;
//      - запрос url файла README из выбранного репозитория
//          https://api.github.com/repos/${login}/${repository}/readme;
//      - запрос самого файла по полученному url.

// компонент рендерит файл Markdown
function ComponentLoadReadme({ repository, login }) {

    // 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [markdown, setMarkdown] = useState("");

    //
    const mounted = useMountedRef();

    // 
    const loadReadme = useCallback(
        async (login, repository) => {
            setLoading(true);

            // запрос адреса файла readme
            const url = `https://api.github.com/repos/${login}/${repository}/readme`;
            const { download_url } = await fetch(url).then(res => res.json());

            // проверка адреса и запрос содержимого файла
            if (download_url) {
                const markdown = await fetch(download_url).then(res => res.text());

                // если компонент не отключен, то состояние может быть изменено
                if (mounted.current) {
                    setMarkdown(markdown);
                    setLoading(false);
                }
            }
        },
        []
    );

    // 
    useEffect(
        () => {
            if (!repository || !login) return;
            // файл загружается после основного рендеринга компонента, при отсутствии 
            //      логина и имени репозитория файл не буедт загружен 
            loadReadme(login, repository).catch(setError);
        },
        // файл будет перезагружен при изменении имени репозитория
        [repository]
    );

    // 
    if (loading) return (<p>...</p>);
    if (error) return (<pre>{JSON.stringify(error, null, 2)}</pre>);

    // отображение файла markdown
    return (
        <div>
            <MarkdownView
                markdown={markdown}
                options={{ tables: true, emoji: true }}
            />
        </div>
    );
}

// 
function ComponentCascadingQueries({ repositories, login }) {

    // 
    const [{ name }, previous, next] = useIterator(repositories);

    // 
    return (
        <div>
            <p>{name}</p>
            <button onClick={previous}>previous</button>
            <button onClick={next}>next</button>
            {
                // загрузка и отображение README
            }
            <ComponentLoadReadme login={login} repository={name} />
        </div>
    );
}

// --- 9.12 Параллельные запросы.

// Для ускорения обработки, запросы можно выполнять параллельно. Параллельные и 
//      каскадные запросы могут работать вместе.

//
function ComponentSearchForm({ startValue, onSearch }) {

    // 
    const [login, setLogin] = useState('');
    const [value, setValue] = useState(startValue);

    // при изменении login выполняется запрос данных пользователя
    const { loading, data, error } = useFetch(
        login ? `https://api.github.com/users/${login}` : ''
    );

    // 
    const renderUser = () => {
        if (loading) return (<p>...</p>);
        if (error) return (<pre>{JSON.stringify(error, null, 2)}</pre>);
        return (
            <div>
                <h3>Первый запрос.</h3>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    // 
    const submit = (e) => {
        e.preventDefault();
        setLogin(value);
        onSearch(value);
    };

    // 
    return (
        <div>
            <form onSubmit={submit}>
                <h3>Форма ввода пользователя.</h3>
                <input type="text" value={value} required
                    onChange={event => setValue(event.target.value)}
                />
                <button>Load.</button>
            </form>
            {renderUser()}
        </div>
    );
}

// выбор репозитория
function ComponentSelectRepository({ repositories, onSelect = f => f }) {

    // 
    const [{ name }, previous, next] = useIterator(repositories);
    const [repository, setRepository] = useState({});

    // 
    const selectRepository = () => {
        let repo = repositories.find((item) => item.name === name);
        setRepository(repo);
        onSelect(repo.name);
    }

    // 
    return (
        <div>
            <p>{name}</p>
            <button onClick={previous}>previous</button>
            <button onClick={selectRepository}>select</button>
            <button onClick={next}>next</button>
            <pre>{JSON.stringify(repository, null, 2)}</pre>
        </div>
    );
}

// загрузка репозиториев
function ComponentLoadRepositories({ login, onSelect = f => f }) {
    return (
        <ComponentFetch
            url={`https://api.github.com/users/${login}/repos`}
            renderSuccess={({ data }) => (
                <ComponentSelectRepository
                    repositories={data}
                    onSelect={onSelect}
                />
            )}
        />
    );
}

// 
function ComponentParallelQueries() {

    // 
    const [login, setLogin] = useState("");
    const [repository, setRepository] = useState("");

    // 
    const handleSearch = login => {
        if (login) {
            return setLogin(login);
        }

        // если поле login пустое, то оба значения login и repository сбрасываются 
        setLogin("");
        setRepository("");
    };

    // Защита состояния: пользователь может сбросить значение login, что приведет 
    //      к отключению компонентов; если отключенный компонент выполняет запрос 
    //      данных, то получение ответа на запрос изменит его состояние и будет 
    //      сгенерирована ошибка. Эта ситуация может происходить при загрузке 
    //      данных через медленную сеть. 

    // если login не выбран, то отображается только форма ввода
    if (!login) {
        return (
            <ComponentSearchForm startValue={login} onSearch={handleSearch} />
        );
    }

    // если login выбран, то отображаются все компоненты
    return (
        <>
            {
                // - выбор имени пользователя и загрузка данных пользователя:
                //      https://api.github.com/users/${login}
                // - одновременно запускается загрузка списка репозиториев:
                //      https://api.github.com/users/${login}/repos
                // - после выбора репозитория каскадно загружается файл readme:
                //      https://api.github.com/repos/${login}/${repository}/readme
                //      download_url
            }
            <h2>1. Компонент формы поиска логина.</h2>
            <ComponentSearchForm startValue={login} onSearch={handleSearch} />
            <h2>2. Компонент загрузки списка репозиториев.</h2>
            {
                // следующие компоненты отправляют запросы на GitHub для получения данных,
                //      компоненты находятся на одном уровне и будут отправлять запросы
                //      параллельно при наличии для этого необходимых данных:
                //      - для всех запросов требуется login
                //      - для получения README требуется repository
                login && (
                    <ComponentLoadRepositories
                        login={login}
                        onSelect={(repository) => setRepository(repository)}
                    />
                )
            }
            {
                // компонент продолжает работать каскадно для получения файла README
                login && repository && (
                    <ComponentLoadReadme login={login} repository={repository} />
                )
            }
        </>
    );
}

// --- 9.13 Запуск.

//
const markdown = `
    | Column 1 | Column 2 |
    |----------|----------|
    | A1       | B1       |
    | A2       | B2       |
`;

//
const users = [
    { name: "first" },
    { name: "second" },
    { name: "third" }
];

// 
const repositories = [
    { name: "NodeJS-technology-stack" },
    { name: "test_for_nodejs" },
];

//
render(
    <>
        <h1>Fetch API.</h1>
        <hr />
        <div>
            <h2>Компонент MarkdownView.</h2>
            <MarkdownView
                markdown={markdown}
                options={{ tables: true, emoji: true }}
            />
        </div>
        <hr />
        <div>
            <h2>Локальные данные.</h2>
            <ComponentLocalStorage login={startLogin} />
        </div>
        <hr />
        <div>
            <h2>Обработка промисов.</h2>
            <ComponentPromise login={startLogin} />
        </div>
        <hr />
        <div>
            <h2>Render props.</h2>
            <ComponentRenderProps users={users} />
        </div>
        <hr />
        <div>
            <h2>Виртуальные списки.</h2>
            <ComponentAllItems users={users} />
            <ComponentVirtualList />
        </div>
        <hr />
        <div>
            <h2>Хук useMountedRef и useFetch.</h2>
            <ComponentUsingHookFetch login={startLogin} />
            <h2>Компонент Fetch.</h2>
            <ComponentFetch url={`https://api.github.com/users/${startLogin}`} />
        </div>
        <hr />
        <div>
            <h2>Отображение списка файлов Markdown.</h2>
            <ComponentRepositories
                login={startLogin}
                repositories={repositories}
                selected="NodeJS-technology-stack"
                onSelect={(name) => console.log(`--- current repository: ${name}`)}
            />
            <h2>Запрос списка репозиториев с отображением Markdown.</h2>
            <ComponentUsingComponentRepositories
                login={startLogin}
                selected="NodeJS-technology-stack"
            />
        </div>
        <hr />
        <div>
            <h2>Каскадные запросы.</h2>
            <ComponentCascadingQueries
                repositories={repositories}
                login={startLogin}
            />
            <h2>Параллельные запросы.</h2>
            <ComponentParallelQueries />
        </div>
        <hr />
    </>,
    document.getElementById('app')
);