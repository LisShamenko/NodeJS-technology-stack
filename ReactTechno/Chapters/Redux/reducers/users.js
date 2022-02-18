// --- Создание редукторов сообщений.

import initialState from './../constants/initialState';
import types from './../constants/types';

// 
export function users(state = initialState.users, action) {
    switch (action.type) {

        case types.GET_USERS: {
            const { users } = action;
            let nextState = Object.assign({}, state);
            for (let user of users) {
                if (!nextState[user.id]) {
                    nextState[user.id] = user;
                }
            }
            return nextState;
        }

        case types.LOAD_POST: {
            const { user } = action;
            let nextState = Object.assign({}, state);
            if (!nextState[user.id]) {
                nextState[user.id] = user;
            }
            return nextState;
        }

        default:
            return state;
    }
}