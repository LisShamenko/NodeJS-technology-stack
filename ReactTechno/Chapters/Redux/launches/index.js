// --- Wrapping.

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

//
import App from './connectApp'; 

//
import middlewareStore from './../stores/middleware';
import initialState from './../constants/initialState';

// 
const store = middlewareStore(initialState);

// 
const renderApp = (state, callback = () => { }) => {
    render(
        <Provider store={store}>
            <App {...state} />
        </Provider >,
        document.getElementById('app'),
        callback
    );
};

// 
renderApp({
    location: window.location.pathname
});