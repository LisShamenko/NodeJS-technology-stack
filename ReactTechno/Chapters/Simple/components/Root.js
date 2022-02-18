"use strict";

// 
import React from 'react';
import AuthorsList from './AuthorsList';
import AuthorPage from './AuthorPage';

// 
class Root extends React.Component {
    render() {
        return (
            <div>
                <AuthorsList></AuthorsList>
                <AuthorPage id='author_1'></AuthorPage>
            </div>
        );
    }
}

// 
export default Root;