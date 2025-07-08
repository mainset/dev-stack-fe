import { runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import type { Configuration as WebpackConfig } from 'webpack';
import type { Configuration as DevServerConfig } from 'webpack-dev-server';

import csrWebappEnvBasedConfig from './webapp.csr.config.mjs';

const csrDevServerWebappEnvBasedConfig: WebpackConfig & DevServerConfig = merge(
  csrWebappEnvBasedConfig,
  {
    devtool: 'inline-source-map',
    devServer: {
      port: process.env.PORT || 3000,
      static: {
        directory: runtimePathById.root,
      },
      historyApiFallback: true,
      hot: true,
    },
  },
);

export default csrDevServerWebappEnvBasedConfig;
