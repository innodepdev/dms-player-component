const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/media/api/v1/', {
      target: 'http://ca-172-16-36-180.vurix.kr/',
      changeOrigin: true,
    })
  );
}