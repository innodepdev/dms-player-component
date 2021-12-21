module.exports = {
    parser: "postcss-scss",
    plugins: [
        require("postcss-flexbugs-fixes"),  // 크로스 브라우징 이슈 처리 플러그인
        require("autoprefixer"),            // 브라우저 별 벤더 prefix 처리 플러그인 (-moz, -webkit..)
        require("postcss-fail-on-warn")     // autoprefixer 실행 시 warning 이 뜨는 경우 에러 표출 처리 플러그인
    ],
};