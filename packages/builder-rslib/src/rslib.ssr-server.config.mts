import '@mainset/cli/process-env-type';
import { NODE_ENV, runtimePathById } from '@mainset/cli/runtime';
import { merge } from '@mainset/toolkit-js';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import type { RslibConfig } from '@rslib/core';
import { defineConfig } from '@rslib/core';
import path from 'path';

const devPresetRslib: Omit<RslibConfig, 'lib'> = {
  mode: NODE_ENV.DEVELOPMENT,
  output: {
    minify: false,
  },
};

const prodPresetRslib: Omit<RslibConfig, 'lib'> = {
  mode: NODE_ENV.PRODUCTION,
  output: {
    minify: false,
  },
};

const ssrServerPresetRslib = defineConfig({
  lib: [
    {
      format: 'esm',
      // OutBase: runtimePathById.dist,
      output: {
        filename: {
          js: '[name].mjs',
        },
      },
    },
  ],
  source: {
    entry: {
      'ssr-server.config': [
        path.join(runtimePathById.root, 'config', 'ssr-server.config.mts'),
      ],
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: path.join(runtimePathById.dist, 'private'),
    },
    filename: {
      css: `css/main.css`,
    },
    // CssModules: {
    //   localIdentName: '[local]--[hash:base64:6]',
    // },
    // https://rsbuild.dev/config/output/source-map#default-behavior
    // sourceMap: true,
  },
  plugins: [pluginReact(), pluginSass()],
  tools: {
    cssLoader: {
      modules: {
        // Support CSS Modules syntax as {import styles from './styles.module.css'}
        namedExport: true,
      },
    },
  },
});

const ssrServerEnvBasedPresetRslib = {
  [NODE_ENV.DEVELOPMENT]: merge(ssrServerPresetRslib, devPresetRslib),
  [NODE_ENV.PRODUCTION]: merge(ssrServerPresetRslib, prodPresetRslib),
};

// NOTE: the default export is used to point config file in {mainset-cli}
export default ssrServerEnvBasedPresetRslib[
  process.env.NODE_ENV || NODE_ENV.PRODUCTION
];
