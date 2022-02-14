const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  module: {
    rules: [ {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: { loader: 'ts-loader', },
    } ],
  },

  devtool: false,

  resolve: { extensions: [ '.ts', '.js' ], },

  devServer: {
    static: {
      directory: path.join(
        path.dirname(__dirname)
      ),
    },
    port: 3000,
    open: true,
  },

  output: {
    filename: 'bundle.js',
    path: path.join(
      path.dirname(__dirname)
    ),
  },

  plugins: [ new HtmlWebpackPlugin({
    template: './src/index.html',
    title: 'Checkers AI',
    filename: 'index.html',
    inject: 'body',
    scriptLoading: 'blocking',
  }) ],
};