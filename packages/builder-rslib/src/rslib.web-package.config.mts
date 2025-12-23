import '@mainset/cli/process-env-type';
import { merge } from '@mainset/toolkit-js';

import { nodeSourcerCommonPresetRslib } from './rslib.node-sourcer.config.mjs';
import { initRslibConfigGenerator } from './utils.mjs';

// NOTE: there is no sense in minimizing {*.min.js} / {*.min.css} output files in node package
// during development debugging complete JS code / full CSS class gives a better dev experience
// the bundler of the final web app should be responsible for the minification of the final output files
const webPackageCommonPresetRslib = merge(nodeSourcerCommonPresetRslib, {
  lib: [],
  output: {
    target: 'web',
    filename: {
      css: 'css/main.css',
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

const generateWebPackageRslibConfig = initRslibConfigGenerator(
  webPackageCommonPresetRslib,
);

export { generateWebPackageRslibConfig, webPackageCommonPresetRslib };

// NOTE: the default export is used to point config file in {mainset-cli}
export default webPackageCommonPresetRslib;
