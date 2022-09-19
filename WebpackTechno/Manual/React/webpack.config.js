// --------------- 2. React.

// Для транспиляции кода с компонентами React требуется добавить предустановку 
//      babel для React.
//      npm i @babel/core babel-loader @babel/preset-env @babel/preset-react --save-dev

// Файл настройки babel для использования предустановки React.
//      {
//          "presets": [
//              "@babel/preset-env", 
//              "@babel/preset-react"
//          ]
//      }

// Webpack сам добавляет ссылку на файл bundle.js в index.html.

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, "source", "index.js")
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "source", "index.html")
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-transform-runtime"
                        ]
                    }
                }
            }
        ]
    },
};