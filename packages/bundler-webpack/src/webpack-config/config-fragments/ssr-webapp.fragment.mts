import { runtimePathById } from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';
import { merge } from 'webpack-merge';

import {
  commonWebappWebpackConfigFragment,
  createPublicAssetsCopyPlugin,
} from './common-webapp.fragment.mjs';

// The entry point for the SSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const ssrEntry = path.join(runtimePathById.src, 'index.ssr.ts');

const bundlerEntry = fs.existsSync(ssrEntry) ? ssrEntry : defaultEntry;

const ssrPublicOutputPath = path.join(
  commonWebappWebpackConfigFragment.output?.path || '',
  'public',
);

const ssrWebappWebpackConfigFragment = merge(
  // NOTE: the Web App config used to compile entry point of {global.css} styles
  commonWebappWebpackConfigFragment,
  {
    entry: [bundlerEntry],
    output: {
      path: ssrPublicOutputPath,
    },
    plugins: [createPublicAssetsCopyPlugin(ssrPublicOutputPath)],
  },
);

export { ssrWebappWebpackConfigFragment };
