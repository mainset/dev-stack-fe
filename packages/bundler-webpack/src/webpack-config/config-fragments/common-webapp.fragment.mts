import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import fs from 'fs';
import path from 'path';

import { commonWebpackConfigFragment } from './common.fragment.mjs';

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

export { commonWebappWebpackConfigFragment };
