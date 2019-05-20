const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const packageJson = require('../package.json');

module.exports = {
  target: 'node',
  context: resolve('src'),
  devtool: 'inline-source-map',
  watchOptions: {
    poll: 1000,
    ignored: ['src/**/*.js', 'node_modules'],
  },
  entry: {
    './module': './module.ts',
    //  'panel/presence/module': './panel/presence/module.ts'
  },
  output: {
    filename: '[name].js',
    path: resolve('dist'),
    libraryTarget: 'amd',
  },
  externals: [
    // remove the line below if you don't want to use buildin versions
    'jquery',
    'lodash',
    'moment',
    'react',
    'react-dom',
    '@grafana/ui',
    function(context, request, callback) {
      var prefix = 'grafana/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request.substr(prefix.length));
      }
      callback();
    },
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CopyWebpackPlugin([
      {from: '../README.md'},
      {from: '**/plugin.json'},
      {from: '**/*.html'},
      {from: '**/*.svg'},
      {from: 'components/*'},
      {from: 'dashboards/*'},
      {from: 'img/*'},
    ]),

    new ReplaceInFileWebpackPlugin([
      {
        dir: 'dist',
        files: ['plugin.json', 'README.md'],
        rules: [
          {
            search: '%VERSION%',
            replace: packageJson.version,
          },
          {
            search: '%TODAY%',
            replace: new Date().toISOString().substring(0, 10),
          },
        ],
      },
    ]),

    new CleanWebpackPlugin(['dist'], {
      root: resolve('.'),
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: 'babel-loader',
            options: {presets: ['env']},
          },
          'ts-loader',
        ],
        exclude: /(node_modules)/,
      },
    ],
  },
};
