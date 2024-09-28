import TerserPlugin from 'terser-webpack-plugin';

const prodWebpackConfigFragment = {
  mode: 'production',
  output: {
    // - Use [contenthash] (or [chunkhash]) instead of [hash] for better long-term caching.
    // - [hash] is for the whole build, so any change invalidates all files.
    filename: 'js/[name].[chunkhash:8].min.js',
    chunkFilename: 'js/[id].[chunkhash:8].min.js',
  },
  optimization: {
    minimizer: [new TerserPlugin()],
    // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-2
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};

export { prodWebpackConfigFragment };
