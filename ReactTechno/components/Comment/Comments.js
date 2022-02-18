import PropTypes from 'prop-types';
import React from 'react';

// 
import Loader from './../Common/Loader';
import Comment from './Comment';

// 
const Comments = props => {
    const { comments, show } = props;

    // 
    if (!show) {
        return (<div></div>);
    }

    // 
    if (!comments) {
        return (<Loader />);
    }

    // Ошибка: 
    //      The `style` prop expects a mapping from style properties to values, not a string.
    //      For example, style={{marginRight: spacing + 'em'}} when using JSX.

    // 
    return (
        <div style={{ border: '1px solid black' }}>
            <h2>Comments:</h2>
            {comments.map(comment => {
                return (<Comment key={comment.id} comment={comment} />);
            })}
        </div>
    );
};

// 
Comments.propTypes = {
    comments: PropTypes.array,
};

// 
export default Comments;