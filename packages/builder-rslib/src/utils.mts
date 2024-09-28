import { merge } from '@mainset/toolkit-js';
import type { RslibConfig } from '@rslib/core';

function initRslibConfigGenerator(dynamicConfigRslib: RslibConfig) {
  return (extendedConfig: Omit<RslibConfig, 'lib'> = {} as RslibConfig) =>
    merge(dynamicConfigRslib, extendedConfig);
}

export { initRslibConfigGenerator, merge };
