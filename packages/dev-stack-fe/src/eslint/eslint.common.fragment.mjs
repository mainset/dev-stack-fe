import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const eslintCommonFragment = defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
]);

export { eslintCommonFragment };
