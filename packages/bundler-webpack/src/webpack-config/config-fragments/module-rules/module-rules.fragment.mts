import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';
import type { RuleSetRule } from 'webpack';

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
    test: /\.(avif|gif|ico|jpe?g|png|svg|webp)$/i,
    exclude: /\.source\.svg$/,
    type: 'asset/resource',
    generator: {
      // NOTE: written to `<output.path>/assets/images/`, loaded from
      // `<output.publicPath>assets/images/`. `[ext]` already includes the dot.
      filename: 'assets/images/[name].[contenthash:8][ext]',
      // NOTE: replaced by the folder in {filename} above — the only option
      // webpack applies to both the file and its URL. {outputPath} never
      // reaches the URL, and a {publicPath} here REPLACES {output.publicPath}:
      // a relative one resolves against the page's URL, which breaks on nested
      // routes (/en/docninja → /en/assets/images/…) and for Module Federation
      // remotes, whose images live on their own origin (CDN), not the host's.
      // NOTE: the following paths are relative to the webpack output path (e.g. dist/)
      // outputPath: 'assets/images/',
      // publicPath: 'assets/images/',
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
