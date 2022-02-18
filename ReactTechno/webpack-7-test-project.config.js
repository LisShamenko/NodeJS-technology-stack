const path = require('path');
const webpack = require('webpack');

// 
process.env["NODE_CONFIG_DIR"] = path.join(__dirname, './server/config');
const config = require('config');
const NODE_ENV = config.get('NODE_ENV');
const ENDPOINT = config.get('ENDPOINT');

// 
module.exports = {
    mode: 'development',
    entry: [
        path.join(__dirname, "Chapters", "TestProject", "index.js")
    ],
    output: {
        path: path.join(__dirname, 'dist', 'TestProject'),
        filename: 'bundle.js'
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify")
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),
                ENDPOINT: JSON.stringify(ENDPOINT),
            }
        }),
    ],
    module: {
        rules: [
            {
                test: path.join(__dirname, "Chapters", "TestProject"),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', "@babel/preset-react"],
                        plugins: ["@babel/plugin-proposal-class-properties", "@babel/plugin-transform-runtime"],
                    },
                }
            },
            {
                test: path.join(__dirname, "components"),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', "@babel/preset-react"],
                        plugins: ["@babel/plugin-proposal-class-properties", "@babel/plugin-transform-runtime"],
                    },
                }
            },
            {
                test: path.join(__dirname, "styles", "styles.scss"), // /\.s[ac]ss$/i
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: { sourceMap: true },
                    },
                    {
                        loader: "sass-loader",
                        options: { sourceMap: true }
                    },
                ],
            },
        ],
    }
};
