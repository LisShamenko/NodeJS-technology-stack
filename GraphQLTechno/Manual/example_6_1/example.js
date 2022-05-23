import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom';

// 
import {
    ApolloProvider, Query, Mutation,
    Subscription, withApollo
} from 'react-apollo';
import {
    ApolloClient, gql, InMemoryCache,
    HttpLink, ApolloLink, split
} from "apollo-boost";

// 
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// 
import { createUploadLink } from 'apollo-upload-client';



// --- 6.2 Конвейер ссылок.

// Пакеты для использования веб-сокетов.
//      npm install apollo-link-ws apollo-utilities subscription-transport-ws

// Apollo Client управляет сетевыми запросами при помощи объекта ApolloLink.
//      Отправляемые операции передаются в ApolloLink для обработки сетевого 
//      запроса. ApolloLink может использоваться для работы с сетью через 
//      веб-сокеты. 

// Для поддержки веб-сокетов следует настроить HttpLink и WebsocketLink.

// объект httpLink используется для отправки HTTP-запросов на адрес 
//      http://localhost:4000/
//      let httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

// функция createUploadLink создает ссылку, которая поддерживает запросы 
//      'multipart/form-data', содержащие файлы загрузки
let httpLink = createUploadLink({ uri: 'http://localhost:4000/graphql' });

// объект wsLink применяется для подключения к 'ws://localhost:4000' и 
//      получения данных через веб-сокеты
let wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: { reconnect: true }
})

// Ссылки могут быть объединены в конвейер для обработки операций GraphQL.
//      Операцию можно отправить не в один ApolloLink, а через цепочку ссылок,
//      где каждая ссылка управляет операцией. Последняя ссылка обработает 
//      запрос и вернет результат.

// ссылка ApolloLink добавляет заголовок авторизации к операциям
const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(async (context) => {
        return {
            headers: {
                ...context.headers,
                "accept": "application/json",
                "authorization": localStorage.getItem('token'),
                "content-type": "application/json",
            }
        }
    });
    return forward(operation);
})

// Объект httpLink объединяется с authLink для обработки авторизации пользователя 
//      через HTTP-запросы. Функция concat - это специальная функция Apollo 
//      для объединения объектов ApolloLinks.
const httpAuthLink = authLink.concat(httpLink);

// Если операция отправляется по ссылке 'http://localhost:4000/', то сначала она 
//      передается в authLink, где добавляется заголовок авторизации, а потом
//      в httpLink для обработки сетевого запроса.

// Функция split используется для разделения операций GraphQL между запросами 
//      HTTP и веб-сокетами. Для операций mutation и query клиент Apollo 
//      отправит HTTP-запросы. Для операции subscription клиент подключится
//      к веб-сокету. 
const link = split(
    // Функция split возвращает одну из двух ApolloLink на основе предиката 
    //      в первом аргументе. Предикат - это функция, которая возвращает 
    //      true или false.
    ({ query }) => {
        // функция getMainDefinition проверяет запрос операции АСД
        const { kind, operation } = getMainDefinition(query);
        // если операция является subscription, то используется wsLink
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    // возвращается, если предикат вернет true
    wsLink,
    // возвращается, если предикат вернет false
    httpAuthLink
)

// конфигурация Apollo Client
let client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache(),
    // функция split позволяет указать клиенту, какую ссылку использовать
    link: link
});

//      const createApolloClient = (authToken) => {
//          return new ApolloClient({
//              link: new WebSocketLink({
//                  uri: "ws://localhost:4000/graphql",
//                  options: {
//                      reconnect: true,
//                      connectionParams: {
//                          headers: {
//                              Authorization: `Bearer ${authToken}`,
//                          },
//                      },
//                  },
//              }),
//              cache: new InMemoryCache(),
//          });
//      };
//      client = createApolloClient();

// --- 6.5 Реализация клиента.

// 
const ALL_PHOTOS_QUERY = gql`
    query {
        totalPhotos
        allPhotos {
            id
            url
            name
            description
        }
    }
`;

const ALL_USERS_QUERY = gql`
    query {
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

// мутация postPhoto
const POST_PHOTO_MUTATION = gql`
    mutation postPhoto($input: PostPhotoInput!) {
        postPhoto(input: $input) {
            id
            name
            url
            description 
        }
    }
`;

// подписка 
const LISTEN_FOR_PHOTOS = gql`
    subscription {
        newPhoto {
            id
            url
            name
            description
        }
    }
`;



// В компонент Subscription передается операция подписки. При создании нового
//      пользователя компонент получит уведомление об этом событии. Компонент 
//      отобразит последнего созданного пользователя, поскольку подписка передает 
//      только одного пользователя за раз.

// Список пользователей можно обновлять через локальный кэш. Данные о каждом 
//      новом пользователе помещаются в кэш, что приводит к обновлению интерфейса.

const SubscriptionNewPhoto = ({ count, users, refetch }) => {
    return (
        <div>
            <h1>Subscription: newPhoto.</h1>
            {
                // компонент Subscription используется для отслеживания 
                //      новых пользователей
            }
            <Subscription subscription={LISTEN_FOR_PHOTOS}>
                {
                    ({ data, loading }) => loading ?
                        <p>loading a new photo...</p> :
                        <div>
                            <h1>JSON: {JSON.stringify(data)}</h1>
                            <p>name: {data.newPhoto && data.newPhoto.name}</p>
                            <img src={data.newPhoto && data.newPhoto.url} alt="" />
                            <p>description: {data.newPhoto && data.newPhoto.description}</p>
                        </div>
                }
            </Subscription>
        </div>
    );
}



// 
const UserListItem = ({ name, avatar }) =>
    <li>
        <img src={avatar} width={48} height={48} alt="" />
        {name}
    </li>

// 
const UserList = ({ users, refetch }) => {
    return (
        <Fragment>
            <button onClick={() => refetch()}>Refetch Users</button>
            <Mutation mutation={ADD_FAKE_USERS_MUTATION} variables={{ count: 1 }}
                refetchQueries={[{ query: ALL_USERS_QUERY }]} >
                {
                    (addFakeUsers) =>
                        <button onClick={addFakeUsers}>
                            Add Fake Users (refetch)
                        </button>
                }
            </Mutation>
            <ul>
                {users.map(user =>
                    <UserListItem
                        key={user.login}
                        name={user.name}
                        avatar={user.avatar}
                    />
                )}
            </ul>
        </Fragment>
    );
}

// 
const Users = () =>
    <Query query={ALL_USERS_QUERY}>
        {
            ({ data, loading, refetch }) => {
                return (loading ?
                    <p>loading users...</p> :
                    <div>
                        <h1>Users: {data.totalUsers}.</h1>
                        <UserList
                            users={data.allUsers}
                            refetch={refetch} />
                    </div>
                );
            }
        }
    </Query >



// компонент используется для отображения всех фотографий после загрузки
const Photos = () => {
    return (
        <Query query={ALL_PHOTOS_QUERY}>
            {
                // для каждой фотографии добавляется элемент img 
                //      с метаданными: id, url, name
                ({ loading, data }) => loading ?
                    <p>loading...</p> :
                    <div>
                        <h1>Photos: {data.totalPhotos}.</h1>
                        {data.allPhotos.map(photo =>
                            <img
                                key={photo.id}
                                src={photo.url}
                                alt={photo.name}
                                width={350} />
                        )}
                    </div>
            }
        </Query>
    );
}



// компонент содержит форму
class PostPhoto extends Component {

    state = {
        name: '',
        description: '',
        category: 'PORTRAIT',
        userLogin: '',
        file: ''
    }

    postPhoto = async (mutation) => {

        //
        await mutation({
            variables: {
                // POST_PHOTO_MUTATION
                input: this.state
                // SINGLE_UPLOAD_MUTATION
                //      file: this.state.file
            }
        }).catch(console.error);

        // Роутер React применяется, чтобы отправить пользователя обратно на домашнюю 
        //      страницу, заменяя текущий маршрут с помощью свойства history.
        //      this.props.history.replace('/')
    }

    // Метод updatePhotos поддерживает обновление кэша. Фото считывается из кэша
    //      при помощи запроса ALL_PHOTOS_QUERY. Метод writeQuery добавляет фотографию
    //      в кэш. Это позволяет синхронизировать локальные данные.
    updatePhotos = (cache, { data: { postPhoto } }) => {

        // КЕШ: обновление кеша после выполнения мутации
        let data = cache.readQuery({ query: ALL_PHOTOS_QUERY });
        if (!data.allPhotos.includes(postPhoto.id)) {
            data.allPhotos = [
                postPhoto,
                ...data.allPhotos
            ];
        }

        // обновление содержимого локального кэша
        cache.writeQuery({ query: ALL_PHOTOS_QUERY, data });
    }

    render() {
        return (
            <form onSubmit={e => e.preventDefault()}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start'
                }}>

                <h1>Post a Photo</h1>

                <input type="text" style={{ margin: '10px' }}
                    placeholder="name" value={this.state.name}
                    onChange={
                        ({ target }) => this.setState({ name: target.value })
                    } />

                <textarea type="text" style={{ margin: '10px' }}
                    placeholder="description" value={this.state.description}
                    onChange={
                        ({ target }) => this.setState({ description: target.value })
                    } />

                <select value={this.state.category} style={{ margin: '10px' }}
                    onChange={
                        ({ target }) => this.setState({ category: target.value })
                    } >
                    <option value="PORTRAIT">PORTRAIT</option>
                    <option value="LANDSCAPE">LANDSCAPE</option>
                    <option value="ACTION">ACTION</option>
                    <option value="GRAPHIC">GRAPHIC</option>
                </select>

                {
                    // запрос всех пользователей для выбора в форме
                }
                <Query query={ALL_USERS_QUERY}>
                    {
                        ({ loading, data }) => loading ? <p>loading users...</p> :
                            <select value={this.state.userLogin} style={{ margin: '10px' }}
                                onChange={
                                    ({ target }) => this.setState({ userLogin: target.value })
                                } >
                                {
                                    data.allUsers.map(user =>
                                        <option key={user.login} value={user.login}>
                                            {user.name}
                                        </option>)
                                }
                            </select>
                    }
                </Query>

                {
                    // элемент формы для ввода файла принимает формат JPEG и 
                    //      устанавливает состояние для file
                }
                <input type="file" style={{ margin: '10px' }} accept="image/jpeg"
                    onChange={
                        ({ target }) => this.setState({
                            file: target.files && target.files.length ? target.files[0] : ''
                        })
                    } />

                {
                    // Компонент Mutation передает мутацию как функцию в postPhoto, чтобы 
                    //      ее можно было использовать для изменения данных фото. После 
                    //      завершения мутации вызывается функция updatePhotos для обновления 
                    //      локального кэша.

                    // Кнопка 'Post Photo' позволяет отправить мутацию.
                }
                <div style={{ margin: '10px' }}>
                    <Mutation mutation={POST_PHOTO_MUTATION} update={this.updatePhotos}>
                        {
                            (mutation) =>
                                <button onClick={() => this.postPhoto(mutation)}>Post Photo</button>
                        }
                    </Mutation>
                    <button onClick={() => this.props.history.goBack()}>Cancel</button>
                </div>
            </form>
        )
    }
}



// 
const ManualSocket = () => {
    return (
        <div style={{ margin: '10px' }}>
            <button onClick={() => {

                console.log('attempt connecting to: ws://localhost:4000/graphql');

                const myWS = new WebSocket('ws://localhost:4000/graphql');

                myWS.onopen = () => {
                    console.log('--- onopen');
                }

                myWS.onerror = (err) => {
                    console.log(`--- onerror --- Error: ${err}`);
                }

                myWS.onmessage = (message) => {
                    console.log(`--- onmessage --- Message: ${message.data}`);
                }

                myWS.onclose = function (event) {
                    if (event.wasClean) {
                        console.log(`--- onclose --- соединение закрыто чисто`);
                    }
                    else {
                        console.log(`--- onclose --- обрыв соединения`);
                    }
                    console.log(`--- onclose --- code: ${event.code} --- reason: ${event.reason}`);
                };
            }}>Connect</button>
        </div>
    );
}



//     
class App extends Component {
    componentDidMount() {
        let { client } = this.props;

        // создается новая подписка при помощи метода subscribe
        this.listenForPhotos = client
            // первая subscribe - это метод клиента Apollo, который отправляет
            //      операцию подписки на сервис и возвращает объект наблюдателя
            .subscribe({ query: LISTEN_FOR_PHOTOS })
            // вторая subscribe - это метод объекта наблюдателя, выполняющий
            //      подписку обработчика на наблюдателя, который будет вызываться
            //      при получении новых пользователей
            .subscribe(({ data: { newPhoto } }) => {

                // КЕШ: обновление кеша через подписку
                const data = client.readQuery({ query: ALL_PHOTOS_QUERY });
                data.totalPhotos += 1;
                data.allPhotos = [
                    ...data.allPhotos,
                    newPhoto
                ];

                // новые пользователи мгновенно попадают в локальный кэш, который 
                //      немедленно обновляет пользовательский интерфейс
                client.writeQuery({ query: ALL_PHOTOS_QUERY, data })
            })
    }
    componentWillUnmount() {
        // подписка отменяется при помощи метода unsubscribe
        this.listenForPhotos.unsubscribe()
    }
    render() {
        return (
            <Fragment>
                <ManualSocket />
                <hr />
                <PostPhoto />
                <hr />
                <SubscriptionNewPhoto />
                <hr />
                <Photos />
                <hr />
                <Users />
            </Fragment>
        );
    }
}

// обеспечивает прямой доступ к экземпляру ApolloClient
const RootComponent = withApollo(App);

// 
ReactDOM.render(
    <ApolloProvider client={client}>
        <RootComponent />
    </ApolloProvider>,
    document.getElementById('root')
);