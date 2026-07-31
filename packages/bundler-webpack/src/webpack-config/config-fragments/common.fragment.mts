import { runtimePathById } from '@mainset/cli/runtime';
import type { Configuration } from 'webpack';

import {
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
  FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENTS,
} from './module-rules/index.mjs';

const commonWebpackConfigFragment: Configuration = {
  output: {
    path: runtimePathById.dist,
  },
  module: {
    rules: [
      BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
      ...IMAGES__RULE__WEBPACK_CONFIG_FRAGMENTS,
      {
        ...FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8].[ext]',
          // NOTE: the following paths are relative to the webpack output path (e.g. dist/)
          outputPath: 'assets/fonts/',
          publicPath: 'assets/fonts/',
        },
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: [
      // Default for {extensions} key: https://webpack.js.org/configuration/resolve/#resolveloader
      '.js',
      '.mjs',
      '.json',
      // Extra / custom
      '.ts',
      '.tsx',
      '.jsx',
    ],
  },
};

export { commonWebpackConfigFragment };
