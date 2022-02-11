import PropTypes from 'prop-types';
import React from 'react';

// 
const PostContent = props => {
    return (<p>{props.post.content}</p>);
};

// 
PostContent.propTypes = {
    post: PropTypes.object
};

// 
export default PostContent;