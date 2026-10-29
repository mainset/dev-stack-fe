export {
  DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK,
  REMOTE_ENTRY_FILENAME__SSR,
  REMOTE_ENTRY_FILENAME__WEBAPP,
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
