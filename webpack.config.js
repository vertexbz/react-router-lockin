const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const lib = path.resolve(__dirname, 'lib');

const myModule = fs.existsSync(src) ? src : lib;

module.exports = {
    context: path.resolve(__dirname),

    entry: {
        example: path.resolve(__dirname, 'example/index.js')
    },

    resolve: {
        modules: ['node_modules'],
        alias: {
            'react-router-lockin': myModule
        }
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    src,
                    path.resolve(__dirname, 'example'),
                ],
                loader: 'babel-loader',
            }
        ],
    },

    devtool: 'source-map',

    plugins: [
        new HtmlWebpackPlugin()
    ]
};
