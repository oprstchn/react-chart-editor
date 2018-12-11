const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: ['react-hot-loader/patch', './dev/index.js'],
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              [
                '@babel/env',
                {
                  targets: {
                    esmodules: true,
                  },
                  modules: false,
                },
              ],
              '@babel/react',
            ],
            plugins: [
              'react-hot-loader/babel',
              '@babel/plugin-proposal-object-rest-spread',
              [
                'module-resolver',
                {
                  root: ['./'],
                  alias: {
                    components: './src/components',
                    lib: './src/lib',
                    styles: './src/styles',
                  },
                },
              ],
            ],
          },
        },
        exclude: [/node_modules/],
      },
      {
        test: /\.(css|scss)?$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new webpack.IgnorePlugin(/vertx/),
    new HtmlWebpackPlugin({
      template: './dev/index.html',
    }),
  ],
  devServer: {
    open: true,
    contentBase: './dev',
  },
  devtool: 'eval-source-map',
};
