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
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', "@babel/preset-react"]
                    }
                }
            }
        ]
    }
};