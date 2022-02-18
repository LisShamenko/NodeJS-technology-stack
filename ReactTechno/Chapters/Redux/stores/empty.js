// --- Creating the 'Store'

import thunk from 'redux-thunk';
import { createStore, compose } from 'redux';

import rootReducer from './../reducers/emptyRoot';

let store;
export default (initialState) => {
    if (store) {
        return store;
    }

    // создать хранилище
    const emptyStore = createStore(
        rootReducer,
        initialState,
        compose(window.devToolsExtension())
    );

    store = emptyStore;

    return store;
};