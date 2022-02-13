import React from "react";
import { render } from "react-dom";

// 
import './../../styles/styles.scss';

// 
import App_Forms from './App_Forms';
import App_Posts from './App_Posts';

// --------------- 8. HTML-формы.

// 
render(
    <>
        <App_Forms />
        <App_Posts />
    </>,
    document.getElementById('app')
);