const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  mode: 'development',

  plugins: [ new HtmlWebpackPlugin({
    template: './src/index.html',
    title: 'Checkers AI',
    filename: 'index.html',
    inject: 'body',
    scriptLoading: 'blocking',
  }),
  new MiniCssExtractPlugin() ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      }, {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader'
        ],
      }, {
        test: /\.(png|ico)$/,
        use: [ {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/',
            publicPath: 'img/',
          },
        } ],
      }
    ],
  },

  devtool: false,

  resolve: {
    extensions: [ '.ts', '.js' ],
  },

  devServer: {
    static: {
      directory: path.join(
        path.dirname(__dirname), 'img'
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
};