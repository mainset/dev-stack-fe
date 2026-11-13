import { fixupConfigRules } from '@eslint/compat';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

const eslintReactFragment = defineConfig([
  // TODO: drop fixupConfigRules once eslint-plugin-react supports ESLint 10
  // (7.37.5 doesn't: its rules still call context.getFilename() & co., which
  // ESLint 10 removed — "contextOrFilename.getFilename is not a function").
  fixupConfigRules(pluginReact.configs.flat.recommended),
  {
    // NOTE: the version-dependent rules follow the project's own `react` —
    // without it, the plugin warns on every run and assumes the latest.
    settings: { react: { version: 'detect' } },
  },
]);

export { eslintReactFragment };
