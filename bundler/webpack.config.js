const path = require("path")
const webpack = require("webpack")

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev'

const DIR_APP = path.join(__dirname, "../src/javascript")
const DIR_STYLES = path.join(__dirname, "../src/style")
const DIR_STATIC = path.join(__dirname, "../static")
const DIR_NODE = "../node_modules"

module.exports = {
   entry: [
      path.join(DIR_APP, "index.js"),
      path.join(DIR_STYLES, "index.scss")
   ],

   resolve: {
      modules: [
         DIR_APP,
         DIR_STYLES,
         DIR_STATIC,
         DIR_NODE
      ],
   },

   plugins: [

      new webpack.DefinePlugin({
         IS_DEVELOPMENT
      }),

      new HtmlWebpackPlugin({
         template: path.resolve(__dirname, '../src/index.html'),
         minify: true
      }),

      new CopyWebpackPlugin({
         patterns: [
            {
               from: "./static",
               to: ""
            }
         ]
      }),

      new MiniCssExtractPlugin({
         filename: "[name].css",
         chunkFilename: "[id].css",
      }),

      new ImageMinimizerPlugin({
         minimizerOptions: {
            plugins: [
               ["gifsicle", { interlaced: true }],
               ["jpegtran", { progressive: true }],
               ["optipng", { optimizationLevel: 5 }],
            ]
         }
      }),

      new CleanWebpackPlugin()
   ],

   module: {
      rules: [

         /**
          * Javascript
          */
         {
            test: /\.js$/,
            use: {
               loader: "babel-loader"
            }
         },

         /**
          * SCSS
          */
         {
            test: /\.scss$/,
            use: [
               {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                     publicPath: ""
                  },
               },
               {
                  loader: "css-loader"
               },
               {
                  loader: "postcss-loader"
               },
               {
                  loader: "sass-loader"
               },
            ]
         },

         /**
          * Images and Fonts
          */
         {
            test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf|otf|fnt|webp)$/,
            loader: "file-loader",
            options: {
               name(file) {
                  return "[hash].[ext]"
               }
            }
         },
         {
            test: /\.(jpe?g|png|gif|svg|webp)$/i,
            use: [
               {
                  loader: ImageMinimizerPlugin.loader,
               },
            ],
         },

         // Shaders
         {
            test: /\.(glsl|vs|fs|vert|frag)$/,
            exclude: /node_modules/,
            use: [
               'raw-loader',
               'glslify-loader'
            ]
         }
      ]
   },

   optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
   },
}
