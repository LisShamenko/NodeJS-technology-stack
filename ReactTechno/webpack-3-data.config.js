"use strict";

const path = require('path');

module.exports = {
    mode: "development",
    entry: [
        path.join(__dirname, "Chapters", "Data", "index.js"),
        path.join(__dirname, "Chapters", "Data", "state.js"),
        path.join(__dirname, "Chapters", "Data", "flows.js"),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "data-bundle.js"
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "Data"),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            "@babel/preset-react",
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                        ]
                    },
                }
            }
        ]
    }
};