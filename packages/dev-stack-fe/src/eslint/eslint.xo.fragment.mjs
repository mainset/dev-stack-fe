import xo from 'eslint-config-xo';
import { defineConfig } from 'eslint/config';

// TODO: remove filtered config when bug will be fixed
// https://github.com/xojs/xo/issues/798#issuecomment-2892108379
const xoFileted = [xo[0], xo[2]];

const eslintXoFragment = defineConfig([
  ...xoFileted,

  {
    rules: {
      // override: {eslint-config-xo}
      'capitalized-comments': 'off',
    },
  },
]);

export { eslintXoFragment };
