import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import fs from 'fs';
import path from 'path';

import { commonWebpackConfigFragment } from './common.fragment.mjs';

const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const ssrEntry = path.join(runtimePathById.src, 'index.ssr.ts');

const bundlerEntry = fs.existsSync(ssrEntry) ? ssrEntry : defaultEntry;

const ssrWebappWebpackConfigFragment = merge(commonWebpackConfigFragment, {
  entry: [
    resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      '@babel/polyfill',
    ),
    bundlerEntry,
  ],
  output: {
    path: path.join(commonWebpackConfigFragment.output.path, 'public'),
  },
});

export { ssrWebappWebpackConfigFragment };
