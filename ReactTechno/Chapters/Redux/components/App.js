// --- 

import PropTypes from 'prop-types';
import React from 'react';
import lodash from 'lodash';

import PostForm from './PostForm';
import Post from './../launches/connectPost';

//
export class App extends React.Component {
    constructor(props) {
        super(props);
        this.getUser = this.getUser.bind(this);
    }

    //
    componentDidMount() {
        this.props.actions.getPosts();
        this.props.actions.getUsers();
    }

    //
    componentDidCatch(err, info) {
        this.props.actions.createError(err, info);
    }

    // 
    getUser(userId) {
        return this.props.users.find(user => user.id === userId);
    }

    // 
    renderForm() {
        return (
            this.props.users.length && (
                <PostForm
                    user={lodash.sample(this.props.users)}
                    onSubmit={this.props.actions.createNewPost}
                />
            )
        );
    }

    //
    renderPosts() {
        return (
            this.props.posts.length && this.props.users.length && (
                <div className="posts">
                    {this.props.posts.map(post => (
                        <Post id={post.id} key={post.id} post={post}
                            user={this.getUser(post.userId)}
                        />
                    ))}
                </div>
            )
        );
    }

    //
    render() {
        return (
            <div className="app">
                {this.renderForm()}
                {this.renderPosts()}
            </div>
        );
    }
}

// 
App.propTypes = {
    posts: PropTypes.arrayOf(PropTypes.object),
    users: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.shape({
        getPosts: PropTypes.func,
        getUsers: PropTypes.func,
        createError: PropTypes.func,
        createNewPost: PropTypes.func,
    })
};

export default App;