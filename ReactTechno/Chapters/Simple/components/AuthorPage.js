"use strict";

//
import React from 'react';

// 
import data from './../data';

//
class AuthorPage extends React.Component {
    render() {

        // маршрутизатор передает идентификатор автора через 
        //      переменную this.props.params.id 
        const author = data[this.props.id];

        // 
        return (
            <div>
                <h2>Page: {author.name}.</h2>
                <ul className="books">
                    {
                        author.books.map((book, key) =>
                            <li key={key} className="book">{book}</li>
                        )
                    }
                </ul>
            </div>
        );
    }
}

// 
export default AuthorPage;