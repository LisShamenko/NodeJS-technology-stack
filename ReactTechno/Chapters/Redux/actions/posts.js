// --- Async 'Action Creators'

import * as serverAPI from './../../../client/serverAPI';

import types from './../constants/types';
import { createError } from './../actions/error';

// 
export function createNewPost(post) {
    return (dispatch, getState) => {

        // 
        const state = getState();
        console.log(`--- ${state}`);

        // 
        return serverAPI.createPost(post)
            .then(res => res.json())
            .then(result => {
                dispatch({
                    type: types.CREATE_POST,
                    post: result.post
                });
            })
            .catch(err => dispatch(createError(err)));
    };
}

//
export function getPosts() {
    return (dispatch) => {
        return serverAPI.fetchPosts()
            .then(res => res.json())
            .then(result => {
                dispatch({
                    type: types.GET_POSTS,
                    posts: result.posts,
                });
            })
            .catch(err => dispatch(createError(err)));
    };
}

//
export function loadPost(postId) {
    return dispatch => {
        return serverAPI.fetchPost(postId)
            .then(res => res.json())
            .then(result => {
                dispatch({
                    type: types.LOAD_POST,
                    post: result.post,
                    user: result.user,
                });
            })
            .catch(err => dispatch(createError(err)));
    };
}