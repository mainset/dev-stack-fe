import path from 'path';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import {
  COMMON_WEBAPP__WEBPACK_CONFIG_FRAGMENT,
  createPublicAssetsCopyPlugin,
} from './common-webapp.fragment.mjs';

// eslint-disable-next-line no-lone-blocks
{
  /*
// The entry point for the SSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const ssrEntry = path.join(runtimePathById.src, 'index.ssr.ts');

const bundlerEntry = fs.existsSync(ssrEntry) ? ssrEntry : defaultEntry;
*/
}

const ssrPublicOutputPath = path.join(
  COMMON_WEBAPP__WEBPACK_CONFIG_FRAGMENT.output?.path || '',
  'public',
);

// The Web App half of an SSR app, written to {dist/public}, which the SSR server serves
const SSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT: Configuration = merge(
  COMMON_WEBAPP__WEBPACK_CONFIG_FRAGMENT,
  {
    // entry: [bundlerEntry],
    output: {
      path: ssrPublicOutputPath,
    },
    plugins: [createPublicAssetsCopyPlugin(ssrPublicOutputPath)],
  },
);

export { SSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT };
