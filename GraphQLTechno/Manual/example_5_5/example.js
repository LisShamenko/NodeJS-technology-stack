import React from "react";
import ReactDOM from 'react-dom';
import { ApolloProvider, Query } from 'react-apollo';
import { ApolloClient, gql, InMemoryCache, HttpLink } from "apollo-boost";
import { request } from 'graphql-request';



// создать клиента Apollo, который будет обрабатывать все сетевые взаимодействия 
//      с помощью сервиса GraphQL, размещенного по адресу http://localhost:4000/
const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "http://localhost:4000/v1/graphql" })
});

// 
(async () => {

    // Функция gql входит в пакет graphql-tag, который включен в пакет apollo-boost.
    //      Функция gql используется для преобразования запроса в АСД, который
    //      можно передать в метод client.query, чтобы отправить запрос на сервер.
    //      Результат запроса преобразуется в объект. 
    const query = gql`
        {
            totalUsers
        }
    `;

    // Клиент кэширует ответы локально в памяти. Функция client.extract возвращает
    //      содержимое кеша. Apollo Client позволяет настроить, как часто 
    //      HTTP-запросы должны отправляться по сети. Apollo Client по умолчанию 
    //      отдает предпочтение локальному кэшу.
    console.log('--- cache before query: ', client.extract());
    await client.query({ query })
        // получение данных
        .then(({ data }) => console.log('--- --- --- data', data))
        // данные запроса будут взяты из кеша
        .then(() => console.log('--- --- --- cache after query: ', client.extract()))
        .catch(console.error);
})();

// 
const UserListItem = ({ name, avatar }) =>
    <li>
        <img src={avatar} width={48} height={48} alt="" />
        {name}
    </li>

// Функция refetch позволяет выполнять повторный запрос корневых данных
//      из сервиса GraphQL. Это один из способов поддерживать синхронизацию
//      UI с данными на сервере.
const UserList = ({ count, users, refetch }) =>
    <div>
        <p>{count} Users</p>
        <button onClick={() => refetch()}>Refetch</button>
        <ul>
            {users.map(user =>
                <UserListItem key={user.login}
                    name={user.name} avatar={user.avatar} />
            )}
        </ul>
    </div>

// мутация
let mutation = `
    mutation addFakeUsers($count: Int!) {
        addFakeUsers(count:$count) {
            login
        }
    }
`;

//
const addUser = () => {
    request('http://localhost:4000', mutation, { count: 1 })
        .catch((err) => {
            console.error(`--- --- ${err}`);
        })
}

// С помощью функции gql строковый запрос преобразуется в объект АСД с именем 
//      ROOT_QUERY, который будет применяться другими компонентами. Преимущество 
//      применения GraphQL заключается в получении всех данных за один запрос.
const ROOT_QUERY = gql`
    query allUsers {
        totalUsers
        allUsers {
            login
            name
            avatar
        }
    }
`;

// выводит сообщение пока не пришел ответ на запрос GraphQL, отправляет
//      ROOT_QUERY в GraphQL и локально кэширует результат
const Users = () =>
    // Компонент Query позволяет повторять запрос для обновления данных
    //      с интервалом указанным в свойстве pollInterval. Например,
    //      обновление данных будет происходить каждую секунду.
    <Query query={ROOT_QUERY} pollInterval={2000}>
        {
            // функцию refetch можно использовать для повторного обновления
            //      ROOT_QUERY или запроса данных с сервера
            ({ data, loading, refetch }) => {
                return (<div>
                    <button onClick={addUser}>Add User</button>
                    {
                        loading ? <p>loading users...</p> :
                            // отображает список пользователей после 
                            //      завершения запроса
                            <UserList
                                count={data.totalUsers}
                                users={data.allUsers}
                                refetch={refetch} />
                    }
                </div>);
            }

            // В дополнение к [loading, data, refetch] объект ответа имеет
            //      дополнительные параметры:
            //      stopPolling - функция, останавливающая опрос
            //      startPolling - функция, запускающая опрос
            //      fetchMore - функция, для получения следующей страницы данных
        }
    </Query>

// компонент приложения
const App = () => <Users />

// компонент ApolloProvider размещает клиента в глобальной области React,
//      любой дочерний компонент будет иметь доступ к клиенту, то есть 
//      сможет отправлять запросы GraphQL через Apollo Client
ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root')
);