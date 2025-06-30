import { runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import fs from 'fs';
import path from 'path';

import { commonWebappWebpackConfigFragment } from './common-webapp.fragment.mjs';

// The entry point for the SSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const ssrEntry = path.join(runtimePathById.src, 'index.ssr.ts');

const bundlerEntry = fs.existsSync(ssrEntry) ? ssrEntry : defaultEntry;

const ssrWebappWebpackConfigFragment = merge(
  commonWebappWebpackConfigFragment,
  {
    entry: [bundlerEntry],
    output: {
      path: path.join(commonWebappWebpackConfigFragment.output.path, 'public'),
    },
  },
);

export { ssrWebappWebpackConfigFragment };
