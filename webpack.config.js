const webpack = require('webpack');
const path = require('path');

module.exports = env => ({
    entry :  "./src/webview/index.tsx",
    mode : env.production? "production" : "development",
    output : {
        path : path.resolve(__dirname, "./out/webview"),
        filename : "webview.bundle.js"
    },
    resolve : {
        extensions : ['.tsx', '.ts', '.jsx', '.js']
    },
    devServer : {
        contentBase : path.resolve(__dirname, 'src/webview/test'),
        hot : true,
        port : 9000,
        disableHostCheck : true,
        headers : {
            "Access-Control-Allow-Origin" : "*"
        }
    },
    module : {
        rules : [
            { test: /\.(ts|tsx)$/, exclude: /(node_modules)/, use: [{loader: 'ts-loader'}] }
        ]
    }
});