// --- Creating 'Middleware'

import { createError } from './../actions/error';

export default store => next => action => {
    try {
        if (action.error) {
            console.error(action.error);
            console.error(action.info);
        }
        return next(action);
    }
    catch (err) {
        return store.dispatch(createError(err));
    }
};