import { fileURLToPath } from 'url';

const stylelintConfigStandardScss = fileURLToPath(
  import.meta.resolve('stylelint-config-standard-scss'),
);

const stylelintDeclarationStrictValue = fileURLToPath(
  import.meta.resolve('stylelint-declaration-strict-value'),
);

/** @type {import('stylelint').Config} */
const mainsetStylelintConfig = {
  extends: [stylelintConfigStandardScss],

  plugins: [stylelintDeclarationStrictValue],

  rules: {
    'declaration-no-important': true,
    'max-nesting-depth': 3,

    // https://github.com/AndyOGo/stylelint-declaration-strict-value?tab=readme-ov-file#primary-options
    'scale-unlimited/declaration-strict-value': [
      [
        // Passing a regex will lint the variable usage for all matching properties
        '/color$/',
      ],
      {
        ignoreValues: ['inherit', 'transparent', 'currentColor', 'none'],
        // Optionally allow CSS custom properties (CSS variables)
        // allowCustomProperties: true,
      },
    ],
  },
};

/** @type {import('stylelint').Config} */
export default mainsetStylelintConfig;
