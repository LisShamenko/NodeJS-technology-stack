import React from "react";
import ReactDOM from 'react-dom';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import { ApolloClient, gql, InMemoryCache, HttpLink } from "apollo-boost";



// 
const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),
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

// 
const ADD_FAKE_USERS_MUTATION = gql`
    mutation addFakeUsers($count:Int!) {
        addFakeUsers(count:$count) {
            login
            name
            avatar
        }
    }
`;

// Компонент Mutation передаст своим дочерним элементам функцию, которая 
//      будет применяться для отправки мутаций.
const UserList = ({ count, users, refetch }) =>
    <div>
        <p>{count} Users</p>
        <button onClick={() => refetch()}>Refetch Users</button>
        {
            // Свойство variables отправляет переменные запроса с мутацией:
            //      count - счетчик. Мутация будет добавлять одного пользователя 
            //      за раз. Компонент Mutation применяет функцию addFakeUsers, 
            //      которая будет отправлять мутацию после ее вызова.
        }
        <Mutation mutation={ADD_FAKE_USERS_MUTATION} variables={{ count: 1 }}>
            {
                // отправляет мутацию при нажатии на кнопку
                (addFakeUsers) => <button onClick={addFakeUsers}>
                    Add Fake Users (no refetch)
                </button>
            }
        </Mutation>
        {
            // Можно указать компоненту Mutation выполнить повторную загрузку 
            //      определенных запросов после завершения мутации.
            // Свойство refetchQueries позволяет указать запросы, которые будут 
            //      выполнены после отправки мутации. Для этого следует поместить
            //      в свойство список объектов, содержащих запросы.
        }
        <Mutation mutation={ADD_FAKE_USERS_MUTATION} variables={{ count: 1 }}
            refetchQueries={[{ query: ROOT_QUERY }]}>
            {
                (addFakeUsers) => <button onClick={addFakeUsers}>
                    Add Fake Users (refetch)
                </button>
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