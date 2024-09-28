const devWebpackConfigFragment = {
  mode: 'development',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].js',
  },
};

export { devWebpackConfigFragment };
