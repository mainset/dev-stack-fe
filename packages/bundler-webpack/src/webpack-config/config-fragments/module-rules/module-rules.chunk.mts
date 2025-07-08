import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';
import type { RuleSetRule } from 'webpack';

// RegEx patterns for matching module rules in Webpack configuration
const CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK = {
  test: /\.(sa|sc|c)ss$/,
};

const CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK = {
  test: /\.module\.(sa|sc|c)ss$/,
};

const FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
};

// Use options for CSS loader rule in Webpack configuration
const CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK: RuleSetRule = {
  loader: resolveHostPackageNodeModulesPath(
    '@mainset/bundler-webpack',
    'css-loader',
  ),
};

const CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK: RuleSetRule = {
  loader: resolveHostPackageNodeModulesPath(
    '@mainset/bundler-webpack',
    'css-loader',
  ),
  // NOTE: by default {css-loader} transforms CSS Modules to hashed class names
  // which is not development-friendly
  options: {
    modules: {
      // hashed class names
      localIdentName: '[local]--[hash:base64:5]',
    },
  },
};

// Use options for CSS styles rule in Webpack configuration
const postcssConfigPath = path.join(
  runtimePathById.root,
  'config',
  'postcss.config.cjs',
);

const CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK = [
  // resolveHostPackageNodeModulesPath(
  //   '@mainset/bundler-webpack',
  //   'resolve-url-loader',
  // ),
  {
    loader: resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      'postcss-loader',
    ),
    options: {
      postcssOptions: {
        config: fs.existsSync(postcssConfigPath) && postcssConfigPath,
      },
    },
  },
  resolveHostPackageNodeModulesPath('@mainset/bundler-webpack', 'sass-loader'),
];

export {
  CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
};
