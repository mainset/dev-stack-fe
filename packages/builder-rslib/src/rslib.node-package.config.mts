import '@mainset/cli/process-env-type';
import { NODE_ENV, runtimePathById } from '@mainset/cli/runtime';
import { defineConfig } from '@rslib/core';
import path from 'path';

import { initRslibConfigGenerator } from './utils.mjs';

// NOTE: there is no sense in minimizing {*.min.js} / {*.min.css} output files in node package
// during development debugging complete JS code / full CSS class gives a better dev experience
// the bundler of the final web app should be responsible for the minification of the final output files
const nodePackageCommonPresetRslib = defineConfig({
  mode: process.env.NODE_ENV || NODE_ENV.PRODUCTION,
  lib: [
    {
      format: 'esm',
      // OutBase: runtimePathById.dist,
      output: {
        filename: {
          js: 'esm/index.mjs',
        },
      },
    },
    {
      format: 'cjs',
      // OutBase: runtimePathById.dist,
      output: {
        filename: {
          js: 'cjs/index.cjs',
        },
      },
    },
  ],
  source: {
    entry: {
      index: [path.join(runtimePathById.src, 'index.mts')],
    },
  },
  output: {
    target: 'web',
    distPath: {
      root: runtimePathById.dist,
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
  tools: {
    cssLoader: {
      modules: {
        // Support CSS Modules syntax as {import styles from './styles.module.css'}
        namedExport: true,
      },
    },
  },
});

const generateNodePackageRslibConfig = initRslibConfigGenerator(
  nodePackageCommonPresetRslib,
);

export { generateNodePackageRslibConfig, nodePackageCommonPresetRslib };

// NOTE: the default export is used to point config file in {mainset-cli}
export default nodePackageCommonPresetRslib;
