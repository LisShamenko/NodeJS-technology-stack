// --- Async 'Action Creators'

import * as serverAPI from './../../../client/serverAPI';

import types from './../constants/types';
import { createError } from './../actions/error';

//
export function getUsers() {
    return (dispatch) => {
        return serverAPI.fetchUsers()
            .then(res => res.json())
            .then(result => {
                dispatch({
                    type: types.GET_USERS,
                    users: result.users
                });
            })
            .catch(err => dispatch(createError(err)));
    };
}