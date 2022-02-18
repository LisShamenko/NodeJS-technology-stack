// --- 'Root Reducer'

import { combineReducers } from 'redux';

import { error } from './../reducers/error';
import { posts } from './../reducers/posts';
import { users } from './../reducers/users';

const rootReducer = combineReducers({
    error, posts, users,
});

export default rootReducer;