const path = require('path');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  process.env.NODE_ENV = argv.mode === 'production' ? 'production' : 'development';

  return {

    entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/index.jsx'],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './dist/'),
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, './dist'),
      },
      port: 8888,
      open: true,
    },
    devtool: 'source-map',
    resolve: { extensions: ['.js', '.jsx'] },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'img/[name][ext]',
          },
        },
        {
          test: /\.(ttf|eot|svg|woff|woff2)$/,
          type: 'asset/resource',
        },
        {
          test: /\.(gltf)$/,
          type: 'asset/resource',
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin(),
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/index.css',
      }),
    ],
    mode: argv.mode === 'production' ? 'production' : 'development',
  };
};
