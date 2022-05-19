import React from "react";
import ReactDOM from 'react-dom';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import { ApolloClient, gql, InMemoryCache, HttpLink } from "apollo-boost";
import { persistCache } from 'apollo-cache-persist';



// конструктор InMemoryCache создает экземпляр кэша
const cache = new InMemoryCache();

// функция persistCache устанавливает хранилище, которое будет использоваться
//      кэшем
persistCache({ cache, storage: localStorage });

// проверка кэша
if (localStorage['apollo-cache-persist']) {
    let cacheData = JSON.parse(localStorage['apollo-cache-persist']);
    cache.restore(cacheData);
}

// объект cache передается при настройке клиента Apollo
const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: cache,
    link: new HttpLink({ uri: "http://localhost:4000/v1/graphql" })
});

// 
const UserListItem = ({ name, avatar }) =>
    <li>
        <img src={avatar} width={48} height={48} alt="" />
        {name}
    </li>

// 
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

// Мутация для получения списка пользователей.
const ADD_FAKE_USERS_MUTATION = gql`
    mutation addFakeUsers($count:Int!) {
        addFakeUsers(count:$count) {
            login
            name
            avatar
        }
    }
`;

// при завершении мутации данные будут переданы в updateUserCache,
//      замена данных в кэше приведет к обновлению UI, что отобразит
//      нового пользвоателя
const updateUserCache = (cache, { data: { addFakeUsers } }) => {

    // считывание данных из кэша и обновление данных
    let data = cache.readQuery({ query: ROOT_QUERY });
    data.totalUsers += addFakeUsers.length;
    data.allUsers = [...data.allUsers, ...addFakeUsers];

    // Данные можно записывать в кэш с помощью метода cache.writeQuery.
    //      Все данные кэша очищаются и возвращаются значения по умолчанию 
    //      для всех полей ROOT_QUERY. Обновление данных в кэше вызовет 
    //      обновление UI и очистит список пользователей.
    cache.writeQuery({ query: ROOT_QUERY, data });
}

// 
const UserList = ({ count, users, refetch }) =>
    <div>
        <p>{count} Users</p>
        <button onClick={() => refetch()}>Refetch Users</button>
        {
            // Мутация получает новый список пользователей и добавляет его в кэш,
            //      что приводит к обновлению UI. 
        }
        <Mutation mutation={ADD_FAKE_USERS_MUTATION} variables={{ count: 1 }}
            update={updateUserCache}>
            {
                (addFakeUsers) => <button onClick={addFakeUsers}>
                    Add Fake User</button>
            }
        </Mutation>
        <ul>
            {users.map(user =>
                <UserListItem key={user.login}
                    name={user.name} avatar={user.avatar} />
            )}
        </ul>
    </div>

// 
const Users = () =>
    <Query query={ROOT_QUERY}>
        {
            ({ data, loading, refetch }) => {
                return (loading ? <p>loading users...</p> :
                    <UserList
                        count={data.totalUsers}
                        users={data.allUsers}
                        refetch={refetch} />
                );
            }
        }
    </Query >

// 
ReactDOM.render(
    <ApolloProvider client={client}>
        <Users />
    </ApolloProvider>,
    document.getElementById('root')
);