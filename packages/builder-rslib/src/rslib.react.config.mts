import '@mainset/cli/process-env-type';
import { merge } from '@mainset/toolkit-js';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

import { nodePackageCommonPresetRslib } from './rslib.node-package.config.mjs';
import { initRslibConfigGenerator } from './utils.mjs';

const reactCommonPresetRslib = merge(nodePackageCommonPresetRslib, {
  lib: [],
  plugins: [pluginReact(), pluginSass()],
});

const generateReactRslibConfig = initRslibConfigGenerator(
  reactCommonPresetRslib,
);

export { generateReactRslibConfig };

// NOTE: the default export is used to point config file in {mainset-cli}
export default reactCommonPresetRslib;
