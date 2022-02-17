// --- Создание редукторов сообщений.

import initialState from './../constants/initialState';
import types from './../constants/types';

// 
export function posts(state = initialState.posts, action) {
    switch (action.type) {

        case types.GET_POSTS: {
            const { posts } = action;
            let nextState = Object.assign({}, state);
            for (let post of posts) {
                if (!nextState[post.id]) {
                    nextState[post.id] = post;
                }
            }
            return nextState;
        }

        case types.CREATE_POST: {
            const { post } = action;
            let nextState = Object.assign({}, state);
            if (!nextState[post.id]) {
                nextState[post.id] = post;
            }
            return nextState;
        }

        case types.LOAD_POST: {
            const { post } = action;
            let nextState = Object.assign({}, state);
            if (!nextState[post.id]) {
                nextState[post.id] = post;
            }
            return nextState;
        }

        default:
            return state;
    }
}