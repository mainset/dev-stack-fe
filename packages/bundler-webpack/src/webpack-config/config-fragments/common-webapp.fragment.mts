import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';
import { merge } from 'webpack-merge';

import { commonWebpackConfigFragment } from './common.fragment.mjs';

// The {public} folder is copied as-is into the build output, if present
const createPublicAssetsCopyPlugin = (outputPath: string) =>
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(runtimePathById.root, 'public'),
        to: outputPath,
        noErrorOnMissing: true, // optional: don't error if public doesn't exist
      },
    ],
  });

// The entry point for Global styles
const cssGlobalStylesEntry = path.join(
  runtimePathById.src,
  'styles',
  'global.css',
);
const scssGlobalStylesEntry = path.join(
  runtimePathById.src,
  'styles',
  'global.scss',
);

const defaultEntry = [
  resolveHostPackageNodeModulesPath(
    '@mainset/bundler-webpack',
    '@babel/polyfill',
  ),
];

if (fs.existsSync(cssGlobalStylesEntry))
  defaultEntry.push(cssGlobalStylesEntry);

if (fs.existsSync(scssGlobalStylesEntry))
  defaultEntry.push(scssGlobalStylesEntry);

const commonWebappWebpackConfigFragment = merge(commonWebpackConfigFragment, {
  entry: defaultEntry,
});

export { commonWebappWebpackConfigFragment, createPublicAssetsCopyPlugin };
