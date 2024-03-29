const path = require("path");
const webpack = require("webpack");
const pkg = require("./package.json");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 웹팩 html 번들 제공
const UglifyJSPlugin = require("uglifyjs-webpack-plugin"); // uglify 플러그인
const StyleLintPlugin = require("stylelint-webpack-plugin"); // style lint 플러그인
const DtsBundleWebpack = require("dts-bundle-webpack"); // d.ts 번들 제공

const BANNER = [
  "DMS VIDEO PLAYER Library",
  "@version " + pkg.version + " | " + new Date().toDateString(),
  "@author " + pkg.author,
  "@license " + pkg.license,
].join("\n");

const config = {
  entry: ["./src/sass/index.scss", "./src/ts/index.ts"],
  output: {
    library: "dmsPlayerComponent", // 라이브러리 네임스페이스 설정
    libraryTarget: "umd", // 라이브러리 타겟 설정
    libraryExport: "default", // 엔트리 포인트의 default export를 네임스페이스에 설정하는 옵션
    path: path.join(__dirname, "dist"),
    // filename: `${pkg.name}.js`,
    filename: "index.js",
    publicPath: "/dist",
  },
  resolve: {
    // 모듈 내에서 사용 하는 import 항목들에 대한 경로 또는 확장자를 처리할 수 있게 도와주는 옵션
    extensions: [".ts", ".tsx", ".js", ".jsx"], // 탐색할 모듈의 확장자 지정
    alias: {
      // 모듈의 경로 사용자 정의 지정, import XXX from '@src/xxx';
      "@src": path.resolve(__dirname, "./src/"),
      "@assets": path.resolve(__dirname, "./src/assets/"),
      "@ts": path.resolve(__dirname, "./src/ts/"),
      "@interfaces": path.resolve(__dirname, "./src/interfaces/"),
      "@components": path.resolve(__dirname, "./src/ts/components"),
      "@service": path.resolve(__dirname, "./src/ts/service"),
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader", "eslint-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(s[ac]ss|css)$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true, // 에러 추적 가능 옵션
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js"),
              },
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "url-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      // html 파일을 읽어 html 파일을 빌드 처리 해준다. (개발 테스트 용도)
      filename: "index.html",
      template: "./src/index.html",
    }),
    new UglifyJSPlugin({
      sourceMap: true,
    }),
    new webpack.BannerPlugin({
      // 번들링 시 상단에 라이브러리 정보 배너 추가
      banner: BANNER,
      entryOnly: true,
    }),
    new StyleLintPlugin(), // style linting 용
    new DtsBundleWebpack({
      name: "@innodep/dms-player-component",
      main: path.resolve(__dirname, "./build/ts/index.d.ts"),
      baseDir: "build",
      out: path.resolve(__dirname, "./dist/index.d.ts"),
    }),
  ],
  devServer: {
    // webpack dev server 설정
    historyApiFallback: false,
    contentBase: "./dist",
    inline: true,
    hot: true,
    disableHostCheck: true,
    proxy: {
      "/media/api/v1/": {
        target: "http://ca-10-10-97-180.vurix.kr/",
        changeOrigin: true,
      },
    },
  },
};

module.exports = config;
