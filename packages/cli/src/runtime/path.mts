import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = process.cwd();

const runtimePathById = {
  // Relative to executable project
  root,

  dist: path.join(root, 'dist'),
  config: path.join(root, 'config'),
  src: path.join(root, 'src'),

  // Relative to file being executed
  msCLISrc: __dirname,
};

export { runtimePathById };
