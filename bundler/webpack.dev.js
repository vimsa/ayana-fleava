const { merge } = require("webpack-merge")
const path = require("path")

const config = require("./webpack.config")

module.exports = merge(config, {
   mode: "development",
   devtool: "inline-source-map",
   devServer: {
      writeToDisk: true,
      host: '0.0.0.0',
      contentBase: './public',
      open: true,
      https: false,
      useLocalIp: true
   },
   output: {
      path: path.resolve(__dirname, "../public")
   }
})
