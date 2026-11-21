import { runtimePathById } from '@mainset/cli/runtime';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import {
  COMMON_WEBAPP__WEBPACK_CONFIG_FRAGMENT,
  createPublicAssetsCopyPlugin,
} from './common-webapp.fragment.mjs';

// eslint-disable-next-line no-lone-blocks
{
  /*
// The entry point for the CSR webapp
const defaultEntry = path.join(runtimePathById.src, 'index.ts');
const csrEntry = path.join(runtimePathById.src, 'index.csr.ts');

const bundlerEntry = fs.existsSync(csrEntry) ? csrEntry : defaultEntry;
*/
}

// A client-rendered app, written to {dist}
const CSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT: Configuration = merge(
  COMMON_WEBAPP__WEBPACK_CONFIG_FRAGMENT,
  {
    // entry: [bundlerEntry],

    plugins: [createPublicAssetsCopyPlugin(runtimePathById.dist)],
  },
);

export { CSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT };
