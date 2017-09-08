require("babel-polyfill");
const Path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Webpack = require("webpack");

var mode = process.env.NODE_ENV
mode = mode
    ? mode
    : "development"

var appEntry = "./src/" + (mode == "development"
    ? "test"
    : "main") + "/index"

const plugins = [ //

    //
];

var DEV_SERVER_PORT = process.env.PORT;
DEV_SERVER_PORT = DEV_SERVER_PORT
    ? DEV_SERVER_PORT
    : 8080;

if (mode == "production") {
    plugins.push(new CopyWebpackPlugin([
        {
            from: "./package.json",
            to: "./"
        }
    ]));
    plugins.push(new Webpack.optimize.OccurrenceOrderPlugin());
    plugins.push(new Webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            unused: true,
            dead_code: true,
            drop_console: true
            // screw_ie8: true,
        },

        output: {
            comments: false
        },
        // turn off mangling entirely in case of variable rename
        sourceMap: false
        // with module = false, no need to set this one
        // mangle: true,
    }));
}

const conf = {
    output: {
        path: Path.resolve("./build/dist"),
        filename: "index.js",
        library: 'shared-components',
        libraryTarget: 'umd'
    },
    entry: [appEntry],
    stats: "minimal",
    module: {
        rules: [
            // if we have many code then use cacheDirectory, but this time almost
            // code is on node_modules
            // ?cacheDirectory=true
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true
                }
            }, {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"]
            }, {
                test: /\.json$/,
                loader: "json-loader"
            }, {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: "file?name=public/fonts/[name].[ext]"
            },
            // inline file as base64
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader?limit=10000"
            }
        ]
    },
    resolve: {
        extensions: [
            ".js", ".jsx"
        ],
        modules: ["node_modules", "./src"]
    },
    devServer: {
        contentBase: "./assets",
        hot: true,
        inline: true,
        port: DEV_SERVER_PORT
    },
    plugins: plugins
}

if (mode == "development") {
    plugins.push(new Webpack.NamedModulesPlugin());
    plugins.push(new Webpack.HotModuleReplacementPlugin());
    plugins.push(new Webpack.SourceMapDevToolPlugin({filename: "[file].map"}));
    conf.entry = [
        "babel-polyfill", // ie
        "react-hot-loader/patch", // this has to be the first loaded plugin in
        // order to work properly!
        "webpack-dev-server/client?http://0.0.0.0:" + DEV_SERVER_PORT, // WebpackDevServer
        // host and
        // port
        "webpack/hot/only-dev-server", // 'only' prevents reload on syntax errors
        appEntry // appʼs entry point
    ];
} else {
    conf.entry = [appEntry];
}

console.log("appEntry: " + appEntry)

module.exports = conf
