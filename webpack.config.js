const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, "app/index.js"),
    output: {
        path: path.resolve(__dirname, "app/static/"),
        filename: "js/bundle.js"
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.(css|sass|scss)$/,
                exclude: path.resolve(__dirname, "node_modules"),
                loaders: ExtractTextPlugin.extract([{
                    loader: "css-loader"
                }, "sass-loader"])
            },
            {
                test: /\.js?$/,
                exclude: path.resolve(__dirname, "node_modules"),
                loader: "babel-loader"
            },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "css/bundle.css",
            allChunks: true
        })
    ]
};