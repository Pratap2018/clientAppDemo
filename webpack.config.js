const path = require("path");
const nodePolyfill = require("node-polyfill-webpack-plugin");
module.exports = {
  mode: "none",
  entry: "./src/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  plugins: [new nodePolyfill()],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
};
