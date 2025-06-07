import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';

const eslintPrettierFragment = defineConfig([
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
]);

export { eslintPrettierFragment };
