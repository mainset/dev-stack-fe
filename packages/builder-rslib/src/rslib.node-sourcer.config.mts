import '@mainset/cli/process-env-type';
import { NODE_ENV, runtimePathById } from '@mainset/cli/runtime';
import { defineConfig } from '@rslib/core';
import path from 'path';

import { initRslibConfigGenerator } from './utils.mjs';

// NOTE: there is no sense in minimizing {*.min.js} / {*.min.css} output files in node package
// during development debugging complete JS code / full CSS class gives a better dev experience
// the bundler of the final web app should be responsible for the minification of the final output files
const nodeSourcerCommonPresetRslib = defineConfig({
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
      autoExternal: {
        // NOTE: bundle source of node_modules from dependencies into the lib build
        dependencies: false,
        devDependencies: true,
        peerDependencies: true,
        optionalDependencies: true,
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
      autoExternal: {
        // NOTE: bundle source of of node_modules from dependencies into the lib build
        dependencies: false,
        devDependencies: true,
        peerDependencies: true,
        optionalDependencies: true,
      },
    },
  ],
  source: {
    entry: {
      index: [path.join(runtimePathById.src, 'index.mts')],
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: runtimePathById.dist,
    },
  },
});

const generateNodeSourcerRslibConfig = initRslibConfigGenerator(
  nodeSourcerCommonPresetRslib,
);

export { generateNodeSourcerRslibConfig, nodeSourcerCommonPresetRslib };

// NOTE: the default export is used to point config file in {mainset-cli}
export default nodeSourcerCommonPresetRslib;
