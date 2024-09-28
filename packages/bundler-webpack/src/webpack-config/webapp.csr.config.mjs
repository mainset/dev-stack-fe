import { NODE_ENV, runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

import { csrWebappWebpackConfigFragment } from './config-fragments/csr-webapp.fragment.mjs';
import { devWebpackConfigFragment } from './config-fragments/dev.fragment.mjs';
import { prodWebpackConfigFragment } from './config-fragments/prod.fragment.mjs';

const csrWebappGeneralConfig = merge(csrWebappWebpackConfigFragment, {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(runtimePathById.src, 'index.template.html'),
    }),
  ],
});

const csrWebappEnvBasedConfig = {
  [NODE_ENV.PRODUCTION]: merge(
    prodWebpackConfigFragment,
    csrWebappGeneralConfig,
  ),
  [NODE_ENV.DEVELOPMENT]: merge(
    devWebpackConfigFragment,
    csrWebappGeneralConfig,
  ),
};

export default csrWebappEnvBasedConfig[process.env.NODE_ENV];
