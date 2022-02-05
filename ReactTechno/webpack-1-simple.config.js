"use strict";

const path = require('path');

module.exports = {
    mode: "development",
    entry: path.join(__dirname, "Chapters", "Simple", "main.js"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "simple-bundle.js"
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "Simple"),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: 'babel_cache',
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};