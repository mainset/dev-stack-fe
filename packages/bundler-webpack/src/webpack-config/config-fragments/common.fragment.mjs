import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';

import babelConfig from '../../babel.config.mjs';

const commonWebpackConfigFragment = {
  output: {
    path: runtimePathById.dist,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: resolveHostPackageNodeModulesPath(
            '@mainset/bundler-webpack',
            'babel-loader',
          ),
          options: babelConfig,
        },
      },
      {
        test: /\.(svg|png)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash].[ext]',
          outputPath: 'dist/assets/images',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
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
