import {
  defineConfig,
  eslintMainsetConfig,
} from './packages/dev-stack-fe/src/eslint/index.mjs';

export default defineConfig([...eslintMainsetConfig]);
