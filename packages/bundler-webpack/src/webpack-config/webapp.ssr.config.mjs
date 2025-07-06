import { NODE_ENV, runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

import { devWebpackConfigFragment } from './config-fragments/dev.fragment.mjs';
import { prodWebpackConfigFragment } from './config-fragments/prod.fragment.mjs';
import { ssrWebappWebpackConfigFragment } from './config-fragments/ssr-webapp.fragment.mjs';
import ssrServerEnvBasedConfig from './server.ssr.config.mjs';

const ssrWebappGeneralConfig = merge(ssrWebappWebpackConfigFragment, {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(runtimePathById.src, 'index.template.html'),
      filename: 'server.html',
    }),
  ],
});

const ssrWebappEnvBasedConfig = {
  [NODE_ENV.PRODUCTION]: merge(
    prodWebpackConfigFragment,
    ssrWebappGeneralConfig,
  ),
  [NODE_ENV.DEVELOPMENT]: merge(
    devWebpackConfigFragment,
    ssrWebappGeneralConfig,
  ),
};

export default [
  ssrServerEnvBasedConfig,
  // NOTE: all Env Based configs declared outside {config-fragments} folder
  ssrWebappEnvBasedConfig[process.env.NODE_ENV],
];
