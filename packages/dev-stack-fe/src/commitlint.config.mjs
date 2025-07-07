import { fileURLToPath } from 'url';

const commitlintConfigConventional = fileURLToPath(
  import.meta.resolve('@commitlint/config-conventional'),
);

const mainsetCommitlintConfig = {
  extends: [commitlintConfigConventional],
};

export { mainsetCommitlintConfig };
