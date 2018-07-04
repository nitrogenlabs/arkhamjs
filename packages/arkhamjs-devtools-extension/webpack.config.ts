import {CheckerPlugin} from 'awesome-typescript-loader';
import * as path from 'path';
import * as webpack from 'webpack';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
const {name, version} = require('./package.json');

module.exports = {
  mode: 'production',
  devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : null,
  entry: {
    app: './src/app.tsx',
    contentScripts: './src/contentScripts.ts',
    devToolsBackground: './src/devToolsBackground.ts'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  plugins: [
    new CleanWebpackPlugin(['lib']),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV) : 'development'
    }),
    new CheckerPlugin(),
    new CopyWebpackPlugin([{from: './src/*.+(json)', to: './', flatten: true}]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'app.html'),
      filename: 'app.html',
      chunks: ["app"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'devToolsBackground.html'),
      filename: 'devToolsBackground.html',
      chunks: ["devToolsBackground"]
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          declaration: false
        }
      },
      {
        test: /\.(json)$/,
        loader: 'file-loader'
      }
    ]
  }
}