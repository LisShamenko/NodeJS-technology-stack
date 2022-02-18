import PropTypes from 'prop-types';
import React from 'react';

// 
import UserHeader from './../Common/UserHeader';
import CommentContent from './CommentContent';

// 
const Comment = props => {
    const { comment } = props;
    return (
        <div key={comment.id}>
            <UserHeader user={comment.user} date={comment.date} />
            <CommentContent comment={comment} />
        </div>
    );
};

// 
Comment.propTypes = {
    comment: PropTypes.shape({
        id: PropTypes.string.isRequired,
        user: PropTypes.object,
        date: PropTypes.string,
        content: PropTypes.string,
    })
};

// 
export default Comment;