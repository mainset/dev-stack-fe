import path from 'path';
import { fileURLToPath } from 'url';

const trivagoPrettierPluginSortImports = path.join(
  path.dirname(fileURLToPath(import.meta.url)), // __dirname
  '../node_modules/@trivago/prettier-plugin-sort-imports/lib/src/index.js',
);

const mainsetPrettierConfig = {
  // Prettier
  trailingComma: 'all',
  singleQuote: true,

  plugins: [trivagoPrettierPluginSortImports],

  // {@trivago/prettier-plugin-sort-imports}
  importOrder: ['^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default mainsetPrettierConfig;
