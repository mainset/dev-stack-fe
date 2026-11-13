export {
  DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK,
  SSR_SCRIPTS_FILENAME,
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
  SSRRemote,
  SSRScriptsByExpose,
  SSRStylesheet,
  SSRStylesheetsByExpose,
} from './module-federation.types.mjs';
