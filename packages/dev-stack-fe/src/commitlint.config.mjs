import path from 'path';
import { fileURLToPath } from 'url';

const commitlintConfigConventional = path.join(
  path.dirname(fileURLToPath(import.meta.url)), // __dirname
  '../node_modules/@commitlint/config-conventional/lib/index.js',
);

const mainsetCommitlintConfig = {
  extends: [commitlintConfigConventional],
};

export { mainsetCommitlintConfig };
