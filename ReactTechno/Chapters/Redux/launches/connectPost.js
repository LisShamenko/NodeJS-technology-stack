
// --- Apply connect.

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import lodash from 'lodash';

import Post from './../components/Post';

import { loadPost } from './../actions/posts';
import { createError } from './../actions/error';



// 
export const mapStateToProps = state => {
    return {
        posts: lodash.orderBy(state.posts, 'date', 'desc'),
    };
};

// 
export const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(
            { loadPost, createError },
            dispatch
        )
    };
};

//
export default connect(mapStateToProps, mapDispatchToProps)(Post);