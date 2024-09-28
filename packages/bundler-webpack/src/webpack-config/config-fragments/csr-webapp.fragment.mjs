import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import fs from 'fs';
import path from 'path';

import { commonWebpackConfigFragment } from './common.fragment.mjs';

const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const csrEntry = path.join(runtimePathById.src, 'index.csr.ts');

const bundlerEntry = fs.existsSync(csrEntry) ? csrEntry : defaultEntry;

const csrWebappWebpackConfigFragment = merge(commonWebpackConfigFragment, {
  entry: [
    resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      '@babel/polyfill',
    ),
    bundlerEntry,
  ],
});

export { csrWebappWebpackConfigFragment };
