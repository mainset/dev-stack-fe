const proxyConfigByPath = {
  '/api-example/': {
    context: ['/api-example/'],
    target: process.env.API_REMOTE_URL,
    pathRewrite: { '^/api-example/': '/' },
    changeOrigin: true,
  },
};

export default proxyConfigByPath;
