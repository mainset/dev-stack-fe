import { defineConfig, globalIgnores } from 'eslint/config';

import { eslintCommonFragment } from './eslint.common.fragment.mjs';
import { eslintPrettierFragment } from './eslint.prettier.fragment.mjs';
import { eslintReactFragment } from './eslint.react.fragment.mjs';
import { eslintTypeScriptFragment } from './eslint.typescript.fragment.mjs';
import { eslintXoFragment } from './eslint.xo.fragment.mjs';

const eslintMainsetConfig = defineConfig([
  ...eslintCommonFragment,
  ...eslintTypeScriptFragment,
  ...eslintXoFragment,
  ...eslintReactFragment,
  ...eslintPrettierFragment,
  globalIgnores(['**/node_modules/**/*', '**/dist/**/*']),
]);

export { eslintMainsetConfig };
