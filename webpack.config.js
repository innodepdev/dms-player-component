const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');

const StyleLintPlugin = require('stylelint-webpack-plugin');        // style lint 플러그인
const MiniCssExtractPlugin = require('mini-css-extract-plugin');    // css 별도 추출 플러그인
const HtmlWebpackPlugin = require('html-webpack-plugin');           // 웹팩 html 번들 제공
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production'; // node 환경 변수 NODE_ENV 에 따라 production mode 사용 여부
const isDevServer = process.env.DEV_SERVER === 'true';      // node 환경 변수 DEV_SERVER 에 따라 devServer mode 사용 여부
const FILENAME = pkg.name + (isProduction ? '.min' : '');
const BANNER = [
    'DMS VIDEO PLAYER Library',
    '@version ' + pkg.version + ' | ' + new Date().toDateString(),
    '@author ' + pkg.author,
    '@license ' + pkg.license
].join('\n');

const config = {
    entry: ['./src/sass/index.scss', './src/ts/index.ts'],
    output: {
        library: 'dmsPlayerComponent',          // 라이브러리 네임스페이스 설정
        libraryTarget: 'umd',                   // 라이브러리 타겟 설정
        libraryExport: 'default',               // 엔트리 포인트의 default export를 네임스페이스에 설정하는 옵션
        path: path.join(__dirname, 'dist'),
        filename: FILENAME + '.js',
        publicPath: '/dist'
    },
    resolve: {  // 모듈 내에서 사용 하는 import 항목들에 대한 경로 또는 확장자를 처리할 수 있게 도와주는 옵션 
        extensions: ['.ts', '.tsx', '.js', '.jsx'], // 탐색할 모듈의 확장자 지정
        alias: {                                    // 모듈의 경로 사용자 정의 지정, import XXX from '@src/xxx';
            '@src': path.resolve(__dirname, './src/'),
            '@ts': path.resolve(__dirname, './src/ts/'),
            '@interfaces': path.resolve(__dirname, './src/interfaces/'),
            '@components': path.resolve(__dirname, './src/ts/components'),
            '@service': path.resolve(__dirname, './src/ts/service'),
            "react": "preact/compat",
            "react-dom": "preact/compat"
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader', 'eslint-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.(s[ac]ss|css)$/i,
                use: [
                    // isDevServer ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true           // 에러 추적 가능 옵션
                        }
                    },
                    { 
                        loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    config: path.resolve(__dirname, 'postcss.config.js')
                                },
                                sourceMap: true,
                            }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
              },
              {
                test: /\.(gif|png|jpe?g)$/,
                use: 'url-loader'
              }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({  // 번들링 시 상단에 라이브러리 정보 배너 추가
            banner: BANNER,
            entryOnly: true
        }),
        new StyleLintPlugin(),      // style linting 용
        new MiniCssExtractPlugin({  // css-loader에서 처리한 결과물을 받아 filename 옵션에 적힌 파일명으로 만들어줌.
            filename: `${FILENAME}.css`
        }),
        new HtmlWebpackPlugin({     // html 파일을 읽어 html 파일을 빌드 처리 해준다.
            filename: 'index.html',
            template: './src/test/index.html'
        }),
        new TypescriptDeclarationPlugin({   // d.ts 파일 생성
            out: 'dms-player-component.d.ts'
        })
    ],
    devtool: 'source-map',  // 배포용 빌드 파일과 원본 파일을 연결시켜주는 기능 (디버깅시 필요한 편의성 기능)
    performance: {          // webpack 번들링 시 waring hint 표출 여부
        hints: process.env.NODE_ENV === 'production' ? "warning" : false
    },
    devServer: {    // webpack dev server 설정
        historyApiFallback: false,
        contentBase: './dist',
        inline: true,
        hot: true,
        disableHostCheck: true,
        proxy: {
            '/media/api/v1/': {
                target: 'http://ca-172-16-36-180.vurix.kr/',
                changeOrigin: true,
            }
        }
    }
};

module.exports = config;