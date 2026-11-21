import { runtimePathById } from '@mainset/cli/runtime';
import fs from 'fs';
import path from 'path';

/**
 * Where a web app's conventional files are. Each one defaults to the app's own file, as before;
 * a package that brings the app itself (an app engine, like `@mainset/docs-kit`) points them at
 * its own files, so the project holds only what is its own.
 */
interface WebAppPaths {
  /** The browser entry, server-rendered mode @default src/index.ssr.ts, else src/index.ts */
  ssrEntry: string;
  /** The browser entry, client-rendered mode @default src/index.csr.ts, else src/index.ts */
  csrEntry: string;
  /** The page's HTML, for html-webpack-plugin @default src/index.template.html */
  htmlTemplate: string;
  /**
   * The SSR server's config, compiled to `dist/private/ssr-server.config.mjs`
   * @default config/ssr-server.config.mts
   */
  ssrServerConfig: string;
  /**
   * Loaded before the app's code, in this order (a CSS reset first)
   * @default src/styles/global.css and src/styles/global.scss, those that exist
   */
  globalStyles: string[];
}

const appEntryPath = (fileName: string) => {
  const entryPath = path.join(runtimePathById.src, fileName);

  return fs.existsSync(entryPath)
    ? entryPath
    : path.join(runtimePathById.src, 'index.ts');
};

/** The app's own conventional files, with {overrides} in their place (`undefined` keeps one) */
function resolveWebAppPaths(overrides: Partial<WebAppPaths> = {}): WebAppPaths {
  const definedOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined),
  ) as Partial<WebAppPaths>;

  return {
    ssrEntry: appEntryPath('index.ssr.ts'),
    csrEntry: appEntryPath('index.csr.ts'),
    htmlTemplate: path.join(runtimePathById.src, 'index.template.html'),
    ssrServerConfig: path.join(runtimePathById.config, 'ssr-server.config.mts'),
    globalStyles: ['global.css', 'global.scss']
      .map((fileName) => path.join(runtimePathById.src, 'styles', fileName))
      .filter((stylesPath) => fs.existsSync(stylesPath)),
    ...definedOverrides,
  };
}

export { resolveWebAppPaths };
export type { WebAppPaths };
