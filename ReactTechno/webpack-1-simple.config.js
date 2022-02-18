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