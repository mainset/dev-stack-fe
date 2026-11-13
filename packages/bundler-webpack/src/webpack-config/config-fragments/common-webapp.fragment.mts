import { runtimePathById } from '@mainset/cli/runtime';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';
import { merge } from 'webpack-merge';

import { commonWebpackConfigFragment } from './common.fragment.mjs';

// The {public} folder is copied as-is into the build output, if present
const createPublicAssetsCopyPlugin = (outputPath: string) =>
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(runtimePathById.root, 'public'),
        to: outputPath,
        noErrorOnMissing: true, // optional: don't error if public doesn't exist
      },
    ],
  });

// The entry point for Global styles
const cssGlobalStylesEntry = path.join(
  runtimePathById.src,
  'styles',
  'global.css',
);
const scssGlobalStylesEntry = path.join(
  runtimePathById.src,
  'styles',
  'global.scss',
);

const defaultEntry: string[] = [];

if (fs.existsSync(cssGlobalStylesEntry))
  defaultEntry.push(cssGlobalStylesEntry);

if (fs.existsSync(scssGlobalStylesEntry))
  defaultEntry.push(scssGlobalStylesEntry);

const commonWebappWebpackConfigFragment = merge(commonWebpackConfigFragment, {
  entry: defaultEntry,
  output: {
    // NOTE: absolute, not webpack's default 'auto' — with 'auto',
    // html-webpack-plugin writes a RELATIVE script src ("js/main.js"), which
    // the browser resolves against the page URL's folder. At "/a/b" it asks
    // for "/a/js/main.js": the SSR server's catch-all answers that with an
    // HTML page, so the page shows its server markup but never hydrates (and,
    // in dev, never gets its styles — style-loader injects them from that
    // bundle). The same goes for CSR's history fallback.
    // Override it for files served from elsewhere — a CDN, or a Module
    // Federation remote, whose files load on its hosts' pages: set
    // {output.publicPath} to where they are.
    publicPath: '/',
  },
});

export { commonWebappWebpackConfigFragment, createPublicAssetsCopyPlugin };
