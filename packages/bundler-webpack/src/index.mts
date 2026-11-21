export { generateEnvBasedWebpackConfig } from './generate-webpack-config.mjs';
export type { GenerateWebpackConfigOptions } from './generate-webpack-config.mjs';
export { resolveWebAppPaths } from './webpack-config/webapp-paths.mjs';
export type { WebAppPaths } from './webpack-config/webapp-paths.mjs';
// NOTE: re-exported so an app can extend the generated config without a
// direct {webpack-merge} dependency of its own.
export { merge as mergeWebpackConfig } from 'webpack-merge';
export { InlineStylesheetsPlugin } from './plugins/inline-stylesheets.plugin.mjs';
