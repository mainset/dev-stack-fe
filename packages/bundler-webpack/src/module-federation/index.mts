export {
  DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK,
  REMOTE_ENTRY_FILENAME__SSR,
  REMOTE_ENTRY_FILENAME__WEBAPP,
  SSR_STYLESHEETS_FILENAME,
} from './module-federation.chunk.mjs';
export {
  generateModuleFederationCommonWebpackConfigFragment,
  generateModuleFederationSsrContainerWebpackConfig,
  generateModuleFederationSsrServerWebpackConfigFragment,
  generateModuleFederationWebappWebpackConfigFragment,
} from './module-federation.fragment.mjs';
export type {
  ModuleFederationConfig,
  ModuleFederationRemote,
  ModuleFederationSharedConfig,
} from './module-federation.types.mjs';
// NOTE: exported for apps that build their webapp compilation without
// generateModuleFederationWebappWebpackConfigFragment, which adds it itself.
export { RemoteStylesheetsPlugin } from './remote-stylesheets.plugin.mjs';
export type { RemoteStylesheetsPluginOptions } from './remote-stylesheets.plugin.mjs';
