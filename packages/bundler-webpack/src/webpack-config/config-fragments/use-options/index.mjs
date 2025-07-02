import {
  resolveHostPackageNodeModulesPath,
  runtimePathById,
} from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';

const postcssConfigPath = path.join(
  runtimePathById.root,
  'config',
  'postcss.config.cjs',
);

const cssStylesUseOptions = [
  // resolveHostPackageNodeModulesPath(
  //   '@mainset/bundler-webpack',
  //   'resolve-url-loader',
  // ),
  {
    loader: resolveHostPackageNodeModulesPath(
      '@mainset/bundler-webpack',
      'postcss-loader',
    ),
    options: {
      postcssOptions: {
        config: fs.existsSync(postcssConfigPath) && postcssConfigPath,
      },
    },
  },
  resolveHostPackageNodeModulesPath('@mainset/bundler-webpack', 'sass-loader'),
];

export { cssStylesUseOptions };
