import type { Configuration as WebpackConfig } from 'webpack';
import type { Configuration as DevServerConfig } from 'webpack-dev-server';
import { merge } from 'webpack-merge';

import { generateCsrDevServerWebappEnvBasedConfig } from './webpack-config/dev-server.csr.config.mjs';
import type { WebAppPaths } from './webpack-config/webapp-paths.mjs';
import { resolveWebAppPaths } from './webpack-config/webapp-paths.mjs';
import { generateSsrEnvBasedConfigs } from './webpack-config/webapp.ssr.config.mjs';

interface GenerateWebpackConfigOptions {
  /**
   * The app's conventional files (entries, HTML template, SSR server config, global styles),
   * each defaulting to the app's own: a package that brings the app engine points them at its
   * own files
   */
  paths?: Partial<WebAppPaths>;
}

const generateEnvBasedWebpackConfig = (
  extendedWebpackConfig: WebpackConfig & DevServerConfig = {},
  // NOTE: by default the app's files are read from the app being built ({process.cwd()}).
  // Custom {paths} serve packages that ship the app themselves (e.g. {@mainset/docs-kit}):
  // their entries, template and SSR server config live in the package, not in the app.
  { paths }: GenerateWebpackConfigOptions = {},
) => {
  const webAppPaths = resolveWebAppPaths(paths);
  const msCliWebpackServeMode = process.env.MS_CLI__WEBPACK_SERVE_MODE;

  switch (msCliWebpackServeMode) {
    case 'ssr': {
      const [ssrServerEnvBasedConfig, ssrWebappEnvBasedConfig] =
        generateSsrEnvBasedConfigs(webAppPaths);

      return [
        merge(ssrServerEnvBasedConfig, extendedWebpackConfig),
        merge(ssrWebappEnvBasedConfig, extendedWebpackConfig),
      ];
    }

    case 'csr':
      return merge(
        generateCsrDevServerWebappEnvBasedConfig(webAppPaths),
        extendedWebpackConfig,
      );
    default:
      throw new Error(
        `Unknown MS_CLI__WEBPACK_SERVE_MODE: ${msCliWebpackServeMode}. Expected 'ssr' or 'csr'.`,
      );
  }
};

export { generateEnvBasedWebpackConfig };
export type { GenerateWebpackConfigOptions };
