import React, { Component } from 'react';
import PropTypes from 'prop-types';

// 
import * as serverAPI from './../../client/serverAPI';

// импорт компонентов Post
import PostContent from './PostContent';
import PostActions from './PostActions';

// импорт компонентов Comment
import Comments from './../Comment/Comments';

// импорт компонентов Common
import UserHeader from './../Common/UserHeader';
import Image from './../Common/Image';
import Loader from './../Common/Loader';

// 
export class Post extends Component {
    constructor(props) {
        super(props);

        //
        this.state = {
            post: null,
            user: null,
            comments: [],
            likes: [],
            isShowComments: false,
        };

        // 
        this.loadPost = this.loadPost.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
    }

    // 
    componentDidMount() {
        this.loadPost(this.props.id);
    }

    // API для загрузки поста
    loadPost(id) {
        serverAPI.fetchPost(id)
            .then(res => res.json())
            .then(result => {
                this.setState(() => ({
                    post: result.post,
                    user: result.user,
                    comments: result.comments,
                    likes: result.likes,
                }));
            });
    }

    // 
    toggleShow() {
        this.setState(() => ({
            isShowComments: !this.state.isShowComments,
        }));
    }

    //
    render() {

        // 
        if (!this.state.post) {
            return (<Loader />);
        }

        //
        return (
            <div>
                <UserHeader date={this.state.post.date} user={this.state.user} />
                <PostContent post={this.state.post} />
                <Image post={this.state.post} />
                <PostActions
                    onClick={this.toggleShow}
                    isShowComments={this.state.isShowComments}
                />
                <Comments
                    comments={this.state.comments}
                    show={this.state.isShowComments}
                    post={this.state.post}
                    user={this.state.user}
                />
            </div>
        );
    }
}

//
Post.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        userId: PropTypes.string,
        comments: PropTypes.array,
        content: PropTypes.string,
        date: PropTypes.number,
        image: PropTypes.string,
        likes: PropTypes.array,
    }),
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        image: PropTypes.string,
    }),
    comments: PropTypes.array,
};

//
export default Post;