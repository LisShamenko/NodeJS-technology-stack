// --- Action Creators

import types from './../constants/types';

export function useData(data) {
    return {
        type: types.USE_DATA,
        data: data
    };
}