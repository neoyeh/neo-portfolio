const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')


module.exports = {
  
  entry: ['@babel/polyfill', './src/index.jsx'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist/'),
  },
  devServer: {
    contentBase: './dist',
    port: 8888,
  },
  devtool: 'source-map',
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /.jsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],   
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          {
            loader: 'css-loader',
            options: {
              // modules: { localIdentName: '[name]__[local]___[hash:base64:5]' },
            }
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|svg|gif|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
            loader: 'file-loader',
        }]
      },
      {
        test: /\.(gltf)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/index.css',
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 8889,
      proxy: 'http://localhost:8888/'
    })
  ],
};