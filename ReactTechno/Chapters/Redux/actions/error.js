// --- 'Action Creators'

import types from './../constants/types';

export function createError(error, info) {
    return {
        type: types.CREATE_ERROR,
        error: error,
        info: info
    };
}