import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

const eslintReactFragment = defineConfig([
  pluginReact.configs.flat.recommended,
]);

export { eslintReactFragment };
