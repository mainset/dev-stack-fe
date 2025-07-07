import { fileURLToPath } from 'url';

const trivagoPrettierPluginSortImports = fileURLToPath(
  import.meta.resolve('@trivago/prettier-plugin-sort-imports'),
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
