import type { Configuration } from 'webpack';

import type { ModuleFederationPluginOptions } from './module-federation.types.mjs';

// The file names a remote's build emits — part of its contract with whatever
// deploys and loads it, hence exported.
const REMOTE_ENTRY_FILENAME__WEBAPP = 'remoteEntry.js';
const REMOTE_ENTRY_FILENAME__SSR = 'ssr-remoteEntry.js';

// NOTE: without this, the webapp entry consumes the shared singletons
// synchronously before Module Federation's share-scope negotiation gets an
// async tick to run, throwing RUNTIME-006 ("Invalid loadShareSync function
// call") on every load. {asyncStartup} wraps entry startup in an async
// boundary so the negotiation can complete first.
const ASYNC_STARTUP__MODULE_FEDERATION_CONFIG_CHUNK: Partial<ModuleFederationPluginOptions> =
  {
    experiments: { asyncStartup: true },
  };

// NOTE: Module Federation's tooling writes into all three folders on every
// compile — the DTS plugin a scratch {tsconfig.<hash>.json} into
// node_modules/.federation, the manifest plugin {mf-manifest.json} into dist,
// and {@module-federation/error-codes} a diagnostics dump into .mf/ (on every
// reported error, at a hardcoded path). Each rewrite bumps mtime even with
// identical content, which a polling watcher reads as a source change: a
// self-sustaining rebuild loop, and a TS error in an exposed module surfaces
// as that loop instead of an error message. None of them is ever a source
// input, so they are excluded outright.
const WATCH_OPTIONS__MODULE_FEDERATION__WEBPACK_CONFIG_CHUNK: Configuration = {
  watchOptions: {
    ignored: ['**/node_modules/**', '**/dist/**', '**/.mf/**'],
  },
};

// Opt-in preset (pass it as {pluginOptions}) for running the dev build inside
// Docker on macOS/Windows: bind-mount file sharing doesn't propagate native fs
// events reliably, so webpack falls back to polling and can't tell "my own
// generated output changed" from a real edit.
// - dts: the default types folder ({@mf-types}) lands in the app root — the
//   bind mount. Redirected into node_modules, which Docker setups usually
//   mask with an anonymous volume.
// - dev: "hot types reload" hardcodes its output to {<app root>/.dev-server}
//   (no option to move it), so it is turned off. Live reload of the remote's
//   code is unaffected.
const DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK: Partial<ModuleFederationPluginOptions> =
  {
    dts: {
      generateTypes: { typesFolder: 'node_modules/.mf-types' },
      consumeTypes: { typesFolder: 'node_modules/.mf-types' },
    },
    dev: { disableHotTypesReload: true },
  };

export {
  ASYNC_STARTUP__MODULE_FEDERATION_CONFIG_CHUNK,
  DOCKER_SAFE__MODULE_FEDERATION_CONFIG_CHUNK,
  REMOTE_ENTRY_FILENAME__SSR,
  REMOTE_ENTRY_FILENAME__WEBAPP,
  WATCH_OPTIONS__MODULE_FEDERATION__WEBPACK_CONFIG_CHUNK,
};
