// --- Apply 'Middleware' to 'Store'

import { createStore, compose, applyMiddleware } from 'redux';

// промежуточно ПО
import thunk from 'redux-thunk';
import crash from './../middleware/crash';

import rootReducer from './../reducers/middlewareRoot';

let store;
export default (initialState) => {
    if (store) {
        return store;
    }

    // 
    const composeEnhancers =
        typeof window === 'object' &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
            }) : compose;

    //
    const createdStore = createStore(
        rootReducer,
        initialState,
        composeEnhancers(
            applyMiddleware(thunk, crash)
        )
    );

    //      const createdStore = createStore(
    //          rootReducer,
    //          initialState,
    //          compose(
    //              applyMiddleware(thunk, crash),
    //              window.devToolsExtension()
    //          )
    //      );

    store = createdStore;

    return store;
};