import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const eslintTypeScriptFragment = defineConfig([tseslint.configs.recommended]);

export { eslintTypeScriptFragment };
