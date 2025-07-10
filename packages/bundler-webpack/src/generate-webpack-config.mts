import { merge } from '@mainset/toolkit-js';
import type { Configuration as WebpackConfig } from 'webpack';
import type { Configuration as DevServerConfig } from 'webpack-dev-server';

import csrDevServerWebappEnvBasedConfig from './webpack-config/dev-server.csr.config.mjs';
import ssrEnvBasedConfigs from './webpack-config/webapp.ssr.config.mjs';

const generateEnvBasedWebpackConfig = (
  extendedWebpackConfig: WebpackConfig & DevServerConfig = {},
) => {
  const [ssrServerEnvBasedConfig, ssrWebappEnvBasedConfig] = ssrEnvBasedConfigs;

  const msCliWebpackServeMode = process.env.MS_CLI__WEBPACK_SERVE_MODE;

  switch (msCliWebpackServeMode) {
    case 'ssr':
      return [
        ssrServerEnvBasedConfig,
        merge(ssrWebappEnvBasedConfig, extendedWebpackConfig),
      ];
    case 'csr':
      return merge(csrDevServerWebappEnvBasedConfig, extendedWebpackConfig);
    default:
      throw new Error(
        `Unknown MS_CLI__WEBPACK_SERVE_MODE: ${msCliWebpackServeMode}. Expected 'ssr' or 'csr'.`,
      );
  }
};

export { generateEnvBasedWebpackConfig };
