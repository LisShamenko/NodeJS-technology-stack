
// --- Apply connect.

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import lodash from 'lodash';

import App from './../components/App';

import { createNewPost, getPosts, loadPost } from './../actions/posts';
import { getUsers } from './../actions/users';
import { createError } from './../actions/error';



// 
export const mapStateToProps = state => {
    return {
        posts: lodash.orderBy(state.posts, 'date', 'desc'),
        users: lodash.orderBy(state.users, 'date', 'desc'),
    };
};

// 
export const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(
            {
                createNewPost, getPosts, loadPost,
                createError,
                getUsers,
            },
            dispatch
        )
    };
};

//
export default connect(mapStateToProps, mapDispatchToProps)(App);