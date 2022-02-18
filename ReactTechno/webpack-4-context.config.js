"use strict";

const path = require('path');

module.exports = {
    mode: "development",
    entry: [
        path.join(__dirname, "Chapters", "Context", "index.js"),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "context-bundle.js"
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "Context"),
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