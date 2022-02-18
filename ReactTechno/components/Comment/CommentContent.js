import PropTypes from 'prop-types';
import React from 'react';

// 
const CommentContent = props => {
    return (<p>{props.comment.content}</p>);
};

// 
CommentContent.propTypes = {
    comment: PropTypes.shape({
        content: PropTypes.string,
    })
};

// 
export default CommentContent;