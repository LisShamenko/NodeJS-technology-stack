import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';

// общие компоненты
import Loader from './../../components/Common/Loader';

// запросы к серверу
import * as serverAPI from './../../client/serverAPI';

// компоненты Post
import Post from './../../components/Post/Post';
import PostForm from './PostForm';

// 
class App_Posts extends React.Component {
    constructor(props) {
        super(props);

        // 
        this.state = {
            error: null,
            loading: false,
            posts: [],
            users: [],
        };

        // 
        this.getPosts = this.getPosts.bind(this);
        this.renderPosts = this.renderPosts.bind(this);
        this.renderSubmit = this.renderSubmit.bind(this);

        // новая привязка
        this.getUsers = this.getUsers.bind(this);
        this.createNewPost = this.createNewPost.bind(this);
        this.renderForm = this.renderForm.bind(this);
    }



    // 
    getUsers() {
        serverAPI.fetchUsers()
            .then(res => {
                return res
                    .json()
                    .then(result => {
                        this.setState(() => ({
                            users: result.users,
                        }));
                    })
                    .catch(err => {
                        this.setState(() => ({ error: err }));
                    });
            });
    }

    //
    createNewPost(post) {

        // дочерний компонент передает данные в функцию обратного вызова,
        //      родительский компонент использует эти данные для выполнения 
        //      операций на сервере

        return serverAPI.createPost(post)
            // вернуть JSON
            .then(res => res.json())
            // обновить состояние
            .then(result => {
                this.setState(prevState => {
                    return {
                        // добавить новый пост в this.state и отсортировать
                        posts: lodash.orderBy(
                            prevState.posts.concat(result.post), 'date', 'desc')
                    };
                });
            })
            .catch(err => {
                this.setState(() => ({ error: err }));
            });
    }

    // 
    renderForm() {
        return (
            this.state.users.length && (

                // Чтобы создать сообщение, необходимо убедиться, что оно сохраняется 
                //      в базе данных, обновлен интерфейс сообщений и обновлен список 
                //      сообщений для пользователя. 

                // Передача функции обратного вызова позволяет связать компоненты 
                //      не сильной связью, компонент PostForm может использоваться 
                //      другим родительским компонентом с другой функцией обратного 
                ///     вызова.

                <PostForm
                    user={lodash.sample(this.state.users)}
                    onSubmit={this.createNewPost}
                />
            )
        );
    }



    //
    render() {
        return (
            <div>
                {this.state.loading ?
                    (<Loader />) :
                    (
                        <div>
                            {this.renderForm()}
                            {this.renderPosts()}
                            {this.renderSubmit()}
                        </div>
                    )}
            </div>
        );
    }

    // --- из предыдущего раздела

    componentDidMount() {
        this.getPosts();
        this.getUsers();
    }

    componentDidCatch(err, info) {
        console.error(err);
        console.error(info);
        this.setState(() => ({ error: err }));
    }

    getPosts() {
        serverAPI.fetchPosts()
            .then(res => {
                return res
                    .json()
                    .then(result => {
                        this.setState(() => ({
                            posts: lodash.orderBy(result.posts, 'date', 'desc'),
                        }));
                    })
                    .catch(err => {
                        this.setState(() => ({ error: err }));
                    });
            });
    }

    renderPosts() {
        return (
            this.state.posts.length && (
                <div>
                    {this.state.posts.map(({ id }) => (
                        <Post id={id} key={id} />
                    ))}
                </div>
            )
        );
    }

    renderSubmit() {
        return (
            <div>
                <button onClick={this.getPosts}>Load posts.</button>
            </div>
        );
    }
}

// 
App_Posts.propTypes = {
    children: PropTypes.node
};

// 
export default App_Posts;