import { runtimePathById } from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { Configuration as WebpackConfig } from 'webpack';
import type { Configuration as DevServerConfig } from 'webpack-dev-server';
import { merge } from 'webpack-merge';

import type { WebAppPaths } from './webapp-paths.mjs';
import { resolveWebAppPaths } from './webapp-paths.mjs';
import { generateCsrWebappEnvBasedConfig } from './webapp.csr.config.mjs';

const proxyConfigPath = path.join(runtimePathById.config, 'proxy.config.mjs');
const proxyConfigByPath = fs.existsSync(proxyConfigPath)
  ? (await import(pathToFileURL(proxyConfigPath).href)).default
  : {};

/** A client-rendered app served by webpack-dev-server, built from {paths} */
const generateCsrDevServerWebappEnvBasedConfig = (
  paths: WebAppPaths,
): WebpackConfig & DevServerConfig =>
  merge(generateCsrWebappEnvBasedConfig(paths), {
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
  });

export { generateCsrDevServerWebappEnvBasedConfig };

export default generateCsrDevServerWebappEnvBasedConfig(resolveWebAppPaths());
