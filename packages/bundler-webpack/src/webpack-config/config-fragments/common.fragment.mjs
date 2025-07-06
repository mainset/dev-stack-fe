import { runtimePathById } from '@mainset/cli/runtime';

import {
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
  FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
} from './module-rules/index.mjs';

const commonWebpackConfigFragment = {
  output: {
    path: runtimePathById.dist,
  },
  module: {
    rules: [
      BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
      IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
      {
        ...FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash].[ext]',
          outputPath: 'dist/assets/fonts',
        },
      },
    ],
  },
  resolve: {
    modules: [runtimePathById.root, 'node_modules'],
    extensions: [
      // Default for {extensions} key: https://webpack.js.org/configuration/resolve/#resolveloader
      '.js',
      '.mjs',
      '.json',
      // Extra / custom
      '.ts',
      '.tsx',
    ],
  },
};

export { commonWebpackConfigFragment };
