export {
  DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK,
  SSR_STYLESHEETS_FILENAME,
} from './module-federation.chunk.mjs';
export {
  generateModuleFederationCommonWebpackConfigFragment,
  generateModuleFederationSSRContainerWebpackConfig,
  generateModuleFederationSSRServerWebpackConfigFragment,
  generateModuleFederationWebappWebpackConfigFragment,
} from './module-federation.fragment.mjs';
export type {
  ModuleFederationConfig,
  ModuleFederationRemote,
  ModuleFederationSharedConfig,
} from './module-federation.types.mjs';
