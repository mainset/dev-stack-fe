import { createRequire } from 'module';

// NOTE: {@module-federation/node} is loaded through its CommonJS build on
// purpose. Its ESM build aliases its own internal {require} calls to
// {__require} (a helper of its bundler), and StreamingTargetPlugin embeds some
// of its source functions verbatim ({fn.toString()}) into the GENERATED
// chunk-loading runtime — so the ESM build leaks a free {__require} into the
// app's bundle ("__require is not defined" at runtime). The CJS build's
// equivalents use plain {require}, which resolves fine.
const requireFromBundler = createRequire(import.meta.url);

const { NodeFederationPlugin, StreamingTargetPlugin } = requireFromBundler(
  '@module-federation/node',
) as typeof import('@module-federation/node');

// NOTE: passed to NodeFederationPlugin as {runtimePlugins} explicitly, instead
// of its own {useRuntimePlugin: true} — that option resolves a path missing
// from the package's ESM build ({../runtimePlugin.mjs}). The package's
// exports map exposes the CJS variant, resolved here.
const NODE_FEDERATION_RUNTIME_PLUGIN_PATH = requireFromBundler.resolve(
  '@module-federation/node/runtimePlugin',
);

export {
  NODE_FEDERATION_RUNTIME_PLUGIN_PATH,
  NodeFederationPlugin,
  StreamingTargetPlugin,
};
