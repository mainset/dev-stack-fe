import { NODE_ENV } from '@mainset/cli/runtime';
import type { NodeEnv } from '@mainset/cli/runtime';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import { DEV__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/dev.fragment.mjs';
import { PROD__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/prod.fragment.mjs';
import { SSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/ssr-webapp.fragment.mjs';
import { generateSsrServerEnvBasedConfig } from './server.ssr.config.mjs';
import type { WebAppPaths } from './webapp-paths.mjs';
import { resolveWebAppPaths } from './webapp-paths.mjs';

// eslint-disable-next-line no-lone-blocks
{
  /*
const ssrWebappGeneralConfig = merge(ssrWebappWebpackConfigFragment, {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(runtimePathById.src, 'index.template.html'),
      filename: 'server.html',
    }),
  ],
});
*/
}

const WEBPACK_CONFIG_FRAGMENT__BY_NODE_ENV = {
  [NODE_ENV.PRODUCTION]: merge(
    PROD__WEBPACK_CONFIG_FRAGMENT,
    // ssrWebappGeneralConfig,
  ),
  [NODE_ENV.DEVELOPMENT]: merge(
    DEV__WEBPACK_CONFIG_FRAGMENT,
    // ssrWebappGeneralConfig,
  ),
};

/** An SSR app, [the SSR server, the Web App]: the fragments, with the app's files from {paths} */
const generateSsrEnvBasedConfigs = (
  paths: WebAppPaths,
): [ssrServerConfig: Configuration, ssrWebappConfig: Configuration] => {
  const ssrServerEnvBasedConfig = generateSsrServerEnvBasedConfig(
    paths.ssrServerConfig,
  );

  const ssrWebappGeneralConfig = merge(SSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT, {
    // NOTE: the global styles come first, before the app's code
    entry: [...paths.globalStyles, paths.ssrEntry],
    plugins: [
      new HtmlWebpackPlugin({
        // template: path.join(runtimePathById.src, 'index.template.html'),
        template: paths.htmlTemplate,
        filename: 'server.html',
      }),
    ],
  });

  const ssrWebappEnvBasedConfig = merge(
    // NOTE: the {NODE_ENV} handled and established in {verifyOrSetNodeEnv} of {ms-cli}
    WEBPACK_CONFIG_FRAGMENT__BY_NODE_ENV[process.env.NODE_ENV! as NodeEnv],
    ssrWebappGeneralConfig,
  );

  return [ssrServerEnvBasedConfig, ssrWebappEnvBasedConfig];
};

const [ssrServerEnvBasedConfig, ssrWebappEnvBasedConfig] =
  generateSsrEnvBasedConfigs(resolveWebAppPaths());

// NOTE: the {tsc} stripping the export in favor of the default export
export {
  generateSsrEnvBasedConfigs,
  ssrServerEnvBasedConfig,
  ssrWebappEnvBasedConfig,
};

// NOTE: the config {ms-cli} runs when the app has no {config/webpack.config.mjs}
export default [
  ssrServerEnvBasedConfig,
  // NOTE: all Env Based configs declared outside {config-fragments} folder
  ssrWebappEnvBasedConfig,
];
