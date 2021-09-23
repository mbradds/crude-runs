import path from "path";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { htmlText } from "./src/htmlText.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const webpack = require("webpack");

const pages = function switchLanguage() {
  const language = ["en", "fr"];

  const htmlPlugins = [];
  language.forEach((lang) => {
    const pageData = {};
    if (lang === "en") {
      pageData.lang = { en: true, fr: false };
    } else if (lang === "fr") {
      pageData.lang = { en: false, fr: true };
    }
    pageData.text = htmlText[lang];
    htmlPlugins.push(
      new HtmlWebpackPlugin({
        page: JSON.parse(JSON.stringify(pageData)),
        filename: `index_${lang}.html`,
        chunks: [`${lang}`],
        chunksSortMode: "auto",
        template: "src/components/index.hbs",
        minify: {
          collapseWhitespace: false,
          keepClosingSlash: false,
          removeComments: false,
          removeRedundantAttributes: false,
          removeScriptTypeAttributes: false,
          removeStyleLinkTypeAttributes: false,
          useShortDoctype: false,
        },
      })
    );
  });

  return htmlPlugins;
};

export default {
  entry: { en: "./src/index_en.js", fr: "./src/index_fr.js" },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
      ],
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/main.[contenthash].css",
    }),
    ...pages(),
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
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        sideEffects: true,
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        options: {
          precompileOptions: { noEscape: true, strict: true },
          // runtime: path.resolve(__dirname, "src/components/helpers.js"),
        },
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
