import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';
import type { RuleSetRule } from 'webpack';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  BABEL_CONFIG__BROWSER,
  BABEL_CONFIG__NODE,
} from '../../../babel.config.mjs';

const createBabelLoaderRule = (
  options: Record<string, unknown>,
): RuleSetRule => ({
  test: /\.((ts|mts|tsx)|(js|mjs|jsx))$/,
  exclude: /node_modules/,
  use: {
    loader: resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      'babel-loader',
    ),
    options,
  },
});

const BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT: RuleSetRule =
  createBabelLoaderRule(BABEL_CONFIG__BROWSER);

// NOTE: dedicated rule for the SSR server bundle (target: 'node') so it uses
// {BABEL_CONFIG__NODE} instead of the browser-targeted preset-env config
const SSR_SERVER_BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT: RuleSetRule =
  createBabelLoaderRule(BABEL_CONFIG__NODE);

const IMAGES__RULE__WEBPACK_CONFIG_FRAGMENTS: RuleSetRule[] = [
  {
    test: /\.(svg|png)$/,
    exclude: /\.source\.svg$/,
    type: 'asset/resource',
    generator: {
      filename: '[name].[contenthash:8].[ext]',
      // NOTE: the following paths are relative to the webpack output path (e.g. dist/)
      outputPath: 'assets/images/',
      publicPath: 'assets/images/',
    },
  },
  {
    test: /\.source\.svg$/,
    type: 'asset/source',
  },
];

export {
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENTS,
  SSR_SERVER_BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
};
