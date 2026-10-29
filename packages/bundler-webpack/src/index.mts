export { generateEnvBasedWebpackConfig } from './generate-webpack-config.mjs';
// NOTE: re-exported so an app can extend the generated config without a
// direct {webpack-merge} dependency of its own.
export { merge as mergeWebpackConfig } from 'webpack-merge';
