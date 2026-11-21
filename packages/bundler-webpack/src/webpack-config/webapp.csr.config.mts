import { NODE_ENV } from '@mainset/cli/runtime';
import type { NodeEnv } from '@mainset/cli/runtime';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import { CSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/csr-webapp.fragment.mjs';
import { DEV__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/dev.fragment.mjs';
import { PROD__WEBPACK_CONFIG_FRAGMENT } from './config-fragments/prod.fragment.mjs';
import type { WebAppPaths } from './webapp-paths.mjs';
import { resolveWebAppPaths } from './webapp-paths.mjs';

// eslint-disable-next-line no-lone-blocks
{
  /*
const csrWebappGeneralConfig = merge(csrWebappWebpackConfigFragment, {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(runtimePathById.src, 'index.template.html'),
    }),
  ],
});
*/
}

const WEBPACK_CONFIG_FRAGMENT__BY_NODE_ENV = {
  [NODE_ENV.PRODUCTION]: merge(
    PROD__WEBPACK_CONFIG_FRAGMENT,
    // csrWebappGeneralConfig
  ),
  [NODE_ENV.DEVELOPMENT]: merge(
    DEV__WEBPACK_CONFIG_FRAGMENT,
    // csrWebappGeneralConfig
  ),
};

/** A client-rendered app: the fragments, with the app's files from {paths} */
const generateCsrWebappEnvBasedConfig = (paths: WebAppPaths): Configuration => {
  // NOTE: the {NODE_ENV} handled and established in {verifyOrSetNodeEnv} of {ms-cli}
  const csrWebappEnvBasedConfig =
    WEBPACK_CONFIG_FRAGMENT__BY_NODE_ENV[process.env.NODE_ENV! as NodeEnv];

  return merge(csrWebappEnvBasedConfig, CSR_WEBAPP__WEBPACK_CONFIG_FRAGMENT, {
    // NOTE: the global styles come first, before the app's code
    entry: [...paths.globalStyles, paths.csrEntry],
    plugins: [new HtmlWebpackPlugin({ template: paths.htmlTemplate })],
  });
};

export { generateCsrWebappEnvBasedConfig };

export default generateCsrWebappEnvBasedConfig(resolveWebAppPaths());
