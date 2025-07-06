import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';

import {
  CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
} from './module-rules/index.mjs';

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
  module: {
    rules: [
      {
        ...CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
        oneOf: [
          // CSS Modules
          {
            ...CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
            use: [
              MiniCssExtractPlugin.loader,
              // NOTE: allow {css-loader} to transform CSS Modules to hashed class names
              CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
              ...CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
            ],
          },
          // Pure CSS support without CSS Modules
          {
            use: [
              MiniCssExtractPlugin.loader,
              // NOTE: do NOT transform Global CSS class names to hashed class names
              // as there is regular string used as class in the app code which will not be transformed
              resolveHostPackageNodeModulesPath(
                '@mainset/bundler-webpack',
                'css-loader',
              ),
              ...CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[chunkhash:8].min.css',
      chunkFilename: 'css/[id].[chunkhash:8].min.css',
    }),
  ],
};

export { prodWebpackConfigFragment };
