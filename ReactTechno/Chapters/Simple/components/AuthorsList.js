"use strict";

// 
import React from 'react';

// 
import data from './../data';

// 
class AuthorsList extends React.Component {
    render() {
        return (
            <div>
                <h1>List:</h1>
                <ul>
                    {
                        Object.keys(data).map(id =>
                            <li key={id}>
                                <span>{`/author/${id}`}</span>
                                <span>{data[id].name}</span>
                            </li>
                        )
                    }
                </ul>
            </div>
        )
    }
}

// 
export default AuthorsList;