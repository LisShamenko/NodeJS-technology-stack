import React, { Component } from "react";
import { render } from "react-dom";
import PropTypes from "prop-types";

// 
class Post extends Component {
    render() {
        return (
            <div>
                <h3>{this.props.user}</h3>
                <span>{this.props.content}</span>
            </div>
        );
    }
}

// 
Post.propTypes = {
    user: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
};

// 
export default Post;