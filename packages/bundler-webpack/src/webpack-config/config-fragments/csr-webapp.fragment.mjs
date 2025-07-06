import { runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';

import { commonWebappWebpackConfigFragment } from './common-webapp.fragment.mjs';

// The entry point for the CSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const csrEntry = path.join(runtimePathById.src, 'index.csr.ts');

const bundlerEntry = fs.existsSync(csrEntry) ? csrEntry : defaultEntry;

const csrWebappWebpackConfigFragment = merge(
  commonWebappWebpackConfigFragment,
  {
    entry: [bundlerEntry],

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(runtimePathById.root, 'public'),
            to: path.join(runtimePathById.dist),
            noErrorOnMissing: true, // optional: don't error if public doesn't exist
          },
        ],
      }),
    ],
  },
);

export { csrWebappWebpackConfigFragment };
