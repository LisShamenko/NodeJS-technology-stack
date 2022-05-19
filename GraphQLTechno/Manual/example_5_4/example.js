import React from "react";
import ReactDOM from 'react-dom';

import { request } from 'graphql-request';



// 
const App = ({ users = [] }) => {
    return (
        <div>
            {users.map(user =>
                <div key={user.login}>
                    <img src={user.avatar} alt="" />
                    {user.name}
                </div>
            )}
            <button onClick={addUser}>Add User</button>
        </div>
    );
}

// рендерит корневой компонент и передает массив пользователей
const render = ({ allUsers = [] }) => {
    return ReactDOM.render(<App users={allUsers} />, document.getElementById('root'));
}

// мутация
let mutation = `
    mutation populate($count: Int!) {
        addFakeUsers(count:$count) {
            login
        }
    }
`;

// обработчик события onClick, вызывает мутацию добавления пользователя и 
//      по ее завершению отправляет запрос для обновления списка пользователей
const addUser = () => {
    request('http://localhost:4000', mutation, { count: 1 })
        .then(requestAndRender)
        .catch((err) => {
            console.error(`--- --- ${err}`);
        })
}

// запрос
let query = `
    query listUsers {
        allUsers {
            avatar
            name
            login
        }
    }
`;

// вызывает запрос, по результату запроса вызывает рендеринг и 
//      передает результат в render
const requestAndRender = () => {
    request('http://localhost:4000', query)
        .then(render)
        .catch((err) => {
            console.error(`--- --- ${err}`);
        })
}

// 
requestAndRender();