import type { NodeEnv } from '@mainset/cli/runtime';
import {
  NODE_ENV,
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import path from 'path';
import type { Configuration } from 'webpack';

import { commonWebpackConfigFragment } from './config-fragments/common.fragment.mjs';
import {
  BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
  CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
  IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
} from './config-fragments/module-rules/index.mjs';

const nullLoaderModuleRules = [
  FONTS__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
].map((ruleTestRegexWebpackConfigFragment) => ({
  ...ruleTestRegexWebpackConfigFragment,
  use: resolveHostPackageNodeModulesPath(
    '@mainset/bundler-webpack',
    'null-loader',
  ),
}));

const ssrServerCommonWebpackConfigFragment: Configuration = {
  // common config
  resolve: commonWebpackConfigFragment.resolve,

  // SSR server dedicated config
  target: 'node',
  entry: {
    'ssr-server.config': path.join(
      runtimePathById.config,
      'ssr-server.config.mts',
    ),
  },
  output: {
    path: path.join(runtimePathById.dist, 'private'),
    filename: '[name].mjs',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  /*
  optimization: {
    // !IMPORTANT: {splitChunks} is designed to optimize the client-side JavaScript
    // When bundling for SSR, splitting chunks usually doesn't make sense, and even breaks SSR — because:
    // - The server expects a single, self-contained entry file.
    // - Lazy-loaded chunks may not be resolvable during SSR runtime.
    splitChunks: false,
  },
  */
  module: {
    rules: [
      // common config
      BABEL_LOADER__RULE__WEBPACK_CONFIG_FRAGMENT,
      IMAGES__RULE__WEBPACK_CONFIG_FRAGMENT,
      // do NOT bundle in SSR mode, because they are not used during rendering on the server
      ...nullLoaderModuleRules,
    ],
  },
};

const generateSSRCssStylesRuleWebpackConfigFragment = ({
  mode,
}: {
  mode: NodeEnv;
}) => {
  const CSS_LOADER__RULE_USE_OPTIONS__BY_MODE = {
    [NODE_ENV.PRODUCTION]:
      CSS_LOADER__PROD_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
    [NODE_ENV.DEVELOPMENT]:
      CSS_LOADER__DEV_RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
  };

  return {
    ...CSS_STYLES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
    oneOf: [
      // CSS Modules
      {
        ...CSS_MODULES__RULE_TEST_REGEX__WEBPACK_CONFIG_CHUNK,
        use: [
          // NOTE: allow {css-loader} to transform CSS Modules to hashed class names while rendering HTML
          merge(
            CSS_LOADER__RULE_USE_OPTIONS__BY_MODE[mode],
            {
              options: {
                modules: {
                  // !IMPORTANT: attach transformed CSS Modules class names into HTML
                  // without compiling CSS inside JS file
                  exportOnlyLocals: true,
                  // - {exportOnlyLocals: true} tells css-loader to only export the mapping of class names to hashes
                  //    (for use in SSR), and not to emit or bundle any CSS.
                  // - This allows your SSR code to inject the correct class names into the rendered HTML,
                  //    without including or compiling CSS into the server bundle.
                },
              },
            },
            {
              isSourceObjMutated: false,
            },
          ),
          ...CSS_STYLES__RULE_USE_OPTIONS__WEBPACK_CONFIG_CHUNK,
        ],
      },
      // Pure CSS support without CSS Modules
      {
        // do NOT bundle in SSR mode, because they are not used during rendering on the server
        use: [
          resolveHostPackageNodeModulesPath(
            '@mainset/bundler-webpack',
            'null-loader',
          ),
        ],
      },
    ],
  };
};

const ssrServerProdWebpackConfigFragment: Configuration = {
  mode: 'production',

  module: {
    rules: [
      generateSSRCssStylesRuleWebpackConfigFragment({
        mode: NODE_ENV.PRODUCTION,
      }),
    ],
  },
};

const ssrServerDevWebpackConfigFragment: Configuration = {
  mode: 'development',

  module: {
    rules: [
      generateSSRCssStylesRuleWebpackConfigFragment({
        mode: NODE_ENV.DEVELOPMENT,
      }),
    ],
  },
};

const ssrServerEnvBasedConfig = {
  [NODE_ENV.PRODUCTION]: merge(
    ssrServerProdWebpackConfigFragment,
    ssrServerCommonWebpackConfigFragment,
  ),
  [NODE_ENV.DEVELOPMENT]: merge(
    ssrServerDevWebpackConfigFragment,
    ssrServerCommonWebpackConfigFragment,
  ),
};

// NOTE: the {NODE_ENV} handled and established in {verifyOrSetNodeEnv} of {ms-cli}
export default ssrServerEnvBasedConfig[process.env.NODE_ENV!];
