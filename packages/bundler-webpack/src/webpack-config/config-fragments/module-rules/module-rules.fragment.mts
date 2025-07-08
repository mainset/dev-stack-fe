import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';
import type { RuleSetRule } from 'webpack';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import babelConfig from '../../../babel.config.mjs';

const BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT: RuleSetRule = {
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

const IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT: RuleSetRule = {
  test: /\.(svg|png)$/,
  type: 'asset/resource',
  generator: {
    filename: '[name].[hash].[ext]',
    outputPath: 'dist/assets/images',
  },
};

export {
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
};
