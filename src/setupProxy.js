const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:7082',
      changeOrigin: true,
      onProxyRes: function(proxyRes, req, res) {
        if (req.headers.origin) {
            proxyRes.headers['access-control-allow-origin'] = req.headers.origin;
        } else {
            proxyRes.headers['access-control-allow-origin'] = '*';
        }
        proxyRes.headers['access-control-allow-credentials'] = 'true';
        proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
      }
    })
  );
};
