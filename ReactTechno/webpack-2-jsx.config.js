"use strict";

const path = require('path');

module.exports = {
    mode: "development",
    entry: [
        path.join(__dirname, "Chapters", "JSX", "index.js"),
        path.join(__dirname, "Chapters", "JSX", "jsx.js"),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "jsx-bundle.js"
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "JSX"),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: 'babel_cache',
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};