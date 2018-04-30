const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  entry: {
    'js/polyfills/array.min.js': './js/polyfills/array.from.js',
    'js/skillbar.min.js': './js/skillbar.js',
    'js/emailform.min.js': './js/emailform.js',
    'js/devcave.min.js': './js/devcave.js',
    'js/archive.min.js': './js/archive.js',
    'css/devcave.min.css': './css/devcave.scss',
    'css/emailform.min.css': './css/emailform.scss',
    'css/syntax.min.css': './css/syntax.scss',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: [['env']],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name]'),
    new BrowserSyncPlugin({
      host: 'localhost',
      proxy: 'http://localhost:4000',
      port: 8080,
      files: ['_site'],
    }),
  ],
};
