var ENV = require('./ENV.json').env;
var PRODUCTION = ENV == 'production' || ENV == 'local';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var webpackConfig = {
  entry: {
    app: [ path.join(__dirname, '/app/app.module.js') ]
  },
  context: path.join(__dirname, '/'),
  output: {
    path: path.join(__dirname, '/public'),
    publicPath: path.join(__dirname, '/public'),
    filename: PRODUCTION ? '[name].bundle.min.js' : '[name].bundle.js'
  },


  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract(
          'style-loader',
          PRODUCTION ? 'css-loader?minimize!autoprefixer-loader' : 'css-loader!autoprefixer-loader'
      )},
      { test: /\.sass$/, loader: ExtractTextPlugin.extract(
          'style-loader',
          PRODUCTION ? 'css-loader?minimize!autoprefixer-loader!sass-loader' : 'css-loader!autoprefixer-loader!sass-loader'
      )},
      { test: /\.scss$/, loader: ExtractTextPlugin.extract(
          'style-loader',
          PRODUCTION ? 'css-loader?minimize!autoprefixer-loader!sass-loader' : 'css-loader!autoprefixer-loader!sass-loader'
      )},
      { test: /\.gif$/, loader: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.jpg$/, loader: 'url-loader?limit=10000&mimetype=image/jpg' },
      { test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.svg/, loader: 'url-loader?limit=1000000&&mimetype=image/svg+xml' },
      { test: /\.(woff|woff2|ttf|eot)/, loader: 'url-loader?limit=1000000&name=[name].[ext]' },
      { test: /\.js$/, loader: 'uglify-loader!babel-loader', exclude: [/node_modules/] },
      // { test: /\.js$/, loader: 'uglify-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.html$/, loader: PRODUCTION ? 'raw-loader!html-minify' : 'raw-loader'}
    ]
  },
  plugins: [
    new ExtractTextPlugin(PRODUCTION ? 'styles.bundle.min.css' : 'styles.bundle.css'),
    new CopyWebpackPlugin([
      { from: 'assets/images', to: 'images' }
    ])
  ],
  eslint: {
    configFile: '.eslintrc'
  }
};

if (PRODUCTION) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      output: {comments: false},
      compress: { warnings: false }
    })
  );
}


module.exports = webpackConfig;
