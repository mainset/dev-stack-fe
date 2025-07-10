import { generateEnvBasedWebpackConfig } from '@mainset/bundler-webpack';
import { NODE_ENV } from '@mainset/cli/runtime';

import proxyConfigByPath from './proxy.config.mjs';

const envBasedWebpackConfigFragment = {
  [NODE_ENV.DEVELOPMENT]: {
    devServer: {
      proxy: Object.values(proxyConfigByPath),
    },
  },
};

const envBasedWebpackConfig = generateEnvBasedWebpackConfig(
  envBasedWebpackConfigFragment[process.env.NODE_ENV],
);

export default envBasedWebpackConfig;
