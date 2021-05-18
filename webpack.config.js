const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    // mode: "development",
    mode: "production",
    entry: "./src/dashboard.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      publicPath: "/dist/",
    },
  
    devServer: {
      compress: true,
    },
  
    devtool: false,
  
    plugins: [
    //   new CopyWebpackPlugin({
    //     patterns: [
    //       {
    //         from: path.resolve(__dirname, "src", "main.css"),
    //         to: path.resolve(__dirname, "dist", "css/main.css"),
    //       },
    //       {
    //         from: path.resolve(__dirname, "src", "GCWeb"),
    //         to: path.resolve(__dirname, "dist", "GCWeb"),
    //       },
    //       {
    //         from: path.resolve(__dirname, "src", "wet-boew"),
    //         to: path.resolve(__dirname, "dist", "wet-boew"),
    //       },
    //     ],
    //   }),
      new CleanWebpackPlugin(),
      // uncomment these lines below for easier browser debugging in development mode
      // new webpack.SourceMapDevToolPlugin({
      //   filename: "dist/[file].map",
      //   fileContext: "public",
      // }),
      // new BundleAnalyzerPlugin(),
    ],
  
    resolve: {
      extensions: ["*", ".js"],
    },
  
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/,
          use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        },
      ],
    },
  
    optimization: {
      minimize: true,
      usedExports: true,
      splitChunks: {
        cacheGroups: {
          highchartsVendor: {
            test: /[\\/]node_modules[\\/](highcharts)[\\/]/,
            chunks: "initial",
            reuseExistingChunk: true,
            enforce: true,
            filename: "vendor/highcharts.[contenthash].js",
          },
        },
      },
    },
  };