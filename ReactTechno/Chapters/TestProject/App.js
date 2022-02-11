import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';

// общие компоненты
import Loader from './../../components/Common/Loader';

// запросы к серверу
import * as serverAPI from './../../client/serverAPI';

// компоненты Post
import Post from './../../components/Post/Post';

// 
class App extends React.Component {
    constructor(props) {
        super(props);

        // инициализация this.state
        this.state = {
            error: null,
            loading: false,
            posts: [],
        };

        // привязка методов 
        this.getPosts = this.getPosts.bind(this);
    }

    //
    componentDidMount() {
        this.getPosts();
    }

    // обработка не перехваченных исключений
    componentDidCatch(err, info) {
        console.error(err);
        console.error(info);
        this.setState(() => ({
            error: err
        }));
    }

    // данные выбираются при помощи запроса на сервер, затем обновляется 
    //      состояние компонента, запрос отправляется при помощи API Fetch
    getPosts() {

        // выполняется запрос на получение идентификаторов сообщений, 
        //      компоненты Post по идентификатору загружают необходимые данные, 
        //      другое решение заключается в том, чтобы получать сразу все данные 
        //      одним запросом и далее распределять их между компонентами Post

        // 
        serverAPI.fetchPosts()
            .then(res => {
                return res
                    .json()
                    .then(result => {
                        this.setState(() => ({
                            // добавить новые посты в this.state и отсортировать
                            posts: lodash.orderBy(result.posts, 'date', 'desc'),
                        }));
                    })
                    .catch(err => {
                        this.setState(() => ({ error: err }));
                    });
            });
    }

    //
    render() {
        return (
            <div>
                {this.state.loading ?
                    (<Loader />) :
                    (
                        <div>
                            {
                                // обработчик кнопки загружает посты
                                <div>
                                    <button onClick={this.getPosts}>Load posts.</button>
                                </div>
                            }
                            {
                                // отобразить посты
                                this.state.posts.length &&
                                (
                                    <div>
                                        <h1>Posts:</h1>
                                        {
                                            // React требует передачи идентификатора, чтобы знать 
                                            //      какие компоненты нужно обновить в динамическом 
                                            //      списке, свойство key обязательно
                                            this.state.posts.map(({ id }) => (
                                                <Post id={id} key={id} />
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </div>
                    )}
            </div>
        );
    }
}

// валидация свойств
App.propTypes = {
    children: PropTypes.node
};

// экспорт
export default App;