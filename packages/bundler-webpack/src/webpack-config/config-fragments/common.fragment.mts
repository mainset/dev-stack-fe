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
          // NOTE: same as the images rule (module-rules.fragment.mts): written
          // to `<output.path>/assets/fonts/`, loaded from
          // `<output.publicPath>assets/fonts/`. `[ext]` already includes the dot.
          filename: 'assets/fonts/[name].[contenthash:8][ext]',
          // NOTE: no {outputPath}/{publicPath} here — a {publicPath} REPLACES
          // {output.publicPath}, and a relative one resolves against the
          // page's URL (style-loader) or the stylesheet's (extracted CSS):
          // fonts 404 on nested routes and for Module Federation remotes,
          // whose fonts live on their own origin (CDN), not the host's.
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
