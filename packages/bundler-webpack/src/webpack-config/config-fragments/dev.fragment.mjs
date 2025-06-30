import { resolveHostPackageNodeModulesPath } from '@mainset/cli/runtime';

import { cssStylesUseOptions } from './use-options/index.mjs';

const devWebpackConfigFragment = {
  mode: 'development',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        oneOf: [
          // CSS Modules
          {
            test: /\.module\.(sa|sc|c)ss$/,
            use: [
              // NOTE: do NOT use {style-loader} in {production} mode
              // https://webpack.js.org/loaders/style-loader/#recommended
              resolveHostPackageNodeModulesPath(
                '@mainset/bundler-webpack',
                'style-loader',
              ),
              // NOTE: by default {css-loader} transforms CSS Modules to hashed class names
              // which is not development-friendly
              {
                loader: resolveHostPackageNodeModulesPath(
                  '@mainset/bundler-webpack',
                  'css-loader',
                ),
                options: {
                  modules: {
                    // hashed class names
                    localIdentName: '[local]--[hash:base64:5]',
                  },
                },
              },
              ...cssStylesUseOptions,
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
              ...cssStylesUseOptions,
            ],
          },
        ],
      },
    ],
  },
};

export { devWebpackConfigFragment };
