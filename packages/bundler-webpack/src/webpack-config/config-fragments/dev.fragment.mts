import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';
import type { Configuration } from 'webpack';

import {
  CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
} from './module-rules/index.mjs';

const devWebpackConfigFragment: Configuration = {
  mode: 'development',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].js',
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
              // NOTE: do NOT use {style-loader} in {production} mode
              // https://webpack.js.org/loaders/style-loader/#recommended
              resolveHostPackageNodeModulesPath(
                '@mainset/bundler-webpack',
                'style-loader',
              ),
              // NOTE: by default {css-loader} transforms CSS Modules to hashed class names
              // which is not development-friendly
              CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
              ...CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
            ],
          },
          // Pure CSS support without CSS Modules
          {
            use: [
              // NOTE: do NOT use {style-loader} in {production} mode
              // https://webpack.js.org/loaders/style-loader/#recommended
              resolveHostPackageNodeModulesPath(
                '@mainset/bundler-webpack',
                'style-loader',
              ),
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
};

export { devWebpackConfigFragment };
