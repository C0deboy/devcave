/* eslint-disable quote-props */

const path = require('path');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  entry: {
    'search/search': './js/search/search.js',
    'search/fetch': './js/search/fetch.js',
    'skillbar': './js/skillbar.js',
    'emailform': './js/emailform.js',
    'devcave': './js/devcave.js',
    'archive': './js/archive.js',
    'syntax': './css/syntax.scss',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].min.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'js'),
        exclude: path.resolve(__dirname, 'js/search/search.js'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-env'],
          },

        },
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'css'),
        use: [
          ExtractCssPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'font/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ExtractCssPlugin({
      filename: 'css/[name].min.css',
    }),
    new OptimizeCssAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
    }),
    new BrowserSyncPlugin({
      host: 'n',
      proxy: 'http://localhost:4000',
      port: 8080,
      files: ['_site'],
    }),
  ],
};
