const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getPlugins(mode) {
    const plugins = [
        new webpack.ProvidePlugin({
            $: 'jquery'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: path.resolve(__dirname, 'index.html'),
        })
    ];

    if (mode === 'production') {
        plugins.push(new MiniCssExtractPlugin());
    } else {
        plugins.push(new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
            exclude: [/node_modules.+\.js/]
        }));
    }

    return plugins;
}

module.exports = (env, argv) => {
    return {
        devServer: {
            contentBase: path.resolve(__dirname),
        },
        devtool: 'cheap-module-eval-source-map',
        entry: './src/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, argv.mode === 'production' ? 'dist' : ''),
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        argv.mode === 'production' ?
                            MiniCssExtractPlugin.loader :
                            'style-loader',
                            'css-loader',
                            'less-loader'
                    ],
                },
                {
                    test: /\.(ttf|otf|png|jpe?g|wav|mov)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]'
                            }
                        }
                    ]
                },
            ]
        },
        plugins: getPlugins(argv.mode)
    };
}