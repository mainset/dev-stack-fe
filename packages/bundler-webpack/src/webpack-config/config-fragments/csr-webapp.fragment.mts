import { runtimePathById } from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';
import { merge } from 'webpack-merge';

import {
  commonWebappWebpackConfigFragment,
  createPublicAssetsCopyPlugin,
} from './common-webapp.fragment.mjs';

// The entry point for the CSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const csrEntry = path.join(runtimePathById.src, 'index.csr.ts');

const bundlerEntry = fs.existsSync(csrEntry) ? csrEntry : defaultEntry;

const csrWebappWebpackConfigFragment = merge(
  commonWebappWebpackConfigFragment,
  {
    entry: [bundlerEntry],

    plugins: [createPublicAssetsCopyPlugin(runtimePathById.dist)],
  },
);

export { csrWebappWebpackConfigFragment };
