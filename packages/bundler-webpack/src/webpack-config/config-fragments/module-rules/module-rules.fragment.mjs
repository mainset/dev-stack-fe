import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';

import babelConfig from '../../../babel.config.mjs';

const BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT = {
  test: /\.(ts|mts|tsx)$/,
  exclude: /node_modules/,
  use: {
    loader: resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      'babel-loader',
    ),
    options: babelConfig,
  },
};

const IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT = {
  test: /\.(svg|png)$/,
  type: 'asset/resource',
  generator: {
    filename: '[name].[hash].[ext]',
    outputPath: 'dist/assets/images',
  },
};

export {
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
};
