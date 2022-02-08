"use strict";

const path = require('path');

module.exports = {
    mode: "development",
    entry: [
        path.join(__dirname, "Chapters", "Rendering", "index.js"),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "rendering-bundle.js"
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "Rendering"),
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