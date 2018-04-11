const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');
const webpack = require('webpack');
const {name, version} = require('./package.json');

module.exports = {
  mode: 'production',
  entry: {
    [name + '-' + version]: './src/index.ts',
    [name + '-' + version + '.min']: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'lib/static'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: name,
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  devtool: 'source-map',
  plugins: [
    new CheckerPlugin()
  ],
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
      exclude: /node_modules/,
      query: {
        declaration: false
      }
    }]
  }
}