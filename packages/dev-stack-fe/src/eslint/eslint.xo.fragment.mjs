import xo from 'eslint-config-xo';
import { defineConfig } from 'eslint/config';

// NOTE: eslint-config-xo stays on 0.50 (package.json) — the last version that
// exports this array of configs (the JS rules first) and needs only ESLint 10.
// From 0.51 it is XO's whole setup instead: a function, bringing its own
// unicorn, import-x, n, ava, … plugins and rules — `xo[0]` is then undefined.
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
