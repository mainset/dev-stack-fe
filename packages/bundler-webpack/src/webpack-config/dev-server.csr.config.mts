import { runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import fs from 'fs';
import path from 'path';
import type { Configuration as WebpackConfig } from 'webpack';
import type { Configuration as DevServerConfig } from 'webpack-dev-server';

import csrWebappEnvBasedConfig from './webapp.csr.config.mjs';

const proxyConfigPath = path.join(runtimePathById.config, 'proxy.config.mjs');
const proxyConfigByPath = fs.existsSync(proxyConfigPath)
  ? (await import(proxyConfigPath)).default
  : {};

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
      proxy: Object.values(proxyConfigByPath),
    },
  },
);

export default csrDevServerWebappEnvBasedConfig;
