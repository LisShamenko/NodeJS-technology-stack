import React, { Component } from 'react';
import PropTypes from 'prop-types';

// импорт компонентов Post
import PostContent from './../../../components/Post/PostContent';

// импорт компонентов Common
import UserHeader from './../../../components/Common/UserHeader';
import Image from './../../../components/Common/Image';

// 
export class Post extends Component {
    constructor(props) {
        super(props);
    }

    //
    render() {
        if (this.props.post && this.props.user) {
            return (
                <div className="post">
                    <UserHeader date={this.props.post.date} user={this.props.user} />
                    <PostContent post={this.props.post} />
                    <Image post={this.props.post} />
                </div>
            );
        }
        else {
            return (<div className="post"></div>);
        }
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
        link: PropTypes.string,
        location: PropTypes.object,
    }),
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        picture: PropTypes.string,
    }),
    comments: PropTypes.array,
    // 
    actions: PropTypes.shape({
        loadPost: PropTypes.func,
    })
};

//
export default Post;