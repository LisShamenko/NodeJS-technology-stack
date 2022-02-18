import PropTypes from 'prop-types';
import React from 'react';

// 
const PostActions = props => {

    //
    const getClass = () => {
        return props.isShowComments ? 'fa fa-angle-up' : 'fa fa-angle-down';
    };

    // 
    return (
        <div>
            <i className='fa fa-thumbs-o-up' />
            <button onClick={props.onClick}>
                <i className='fa fa-commenting-o' />
                <i className={getClass()} />
            </button>
        </div>
    );
};

// 
PostActions.propTypes = {
    isShowComments: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

// 
export default PostActions;