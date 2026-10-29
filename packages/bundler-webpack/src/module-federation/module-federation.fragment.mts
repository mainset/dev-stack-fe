import { runtimePathById } from '@mainset/cli/runtime';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import fs from 'fs';
import path from 'path';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import ssrServerEnvBasedConfig from '../webpack-config/server.ssr.config.mjs';
import {
  NODE_FEDERATION_RUNTIME_PLUGIN_PATH,
  NodeFederationPlugin,
  StreamingTargetPlugin,
} from './module-federation-node.mjs';
import {
  ASYNC_STARTUP__MODULE_FEDERATION_CONFIG_CHUNK,
  REMOTE_ENTRY_FILENAME__SSR,
  REMOTE_ENTRY_FILENAME__WEBAPP,
  WATCH_OPTIONS__MODULE_FEDERATION__WEBPACK_CONFIG_CHUNK,
} from './module-federation.chunk.mjs';
import type {
  ModuleFederationConfig,
  ModuleFederationRemote,
} from './module-federation.types.mjs';
import { RemoteStylesheetsPlugin } from './remote-stylesheets.plugin.mjs';

// NOTE: an SSR host's server entry has to reach its SSR config through a
// dynamic import — a static import of the shared deps (e.g. react-dom/server)
// fails Module Federation's share-scope negotiation ({loadShareSync failed}).
// That async boundary is app code, so it lives next to the SSR config by
// convention, the same way {ssr-server.config.mts} does.
const SSR_SERVER_ENTRY_PATH = path.join(
  runtimePathById.config,
  'ssr-server.entry.mts',
);

// { landing: { webappEntry: 'https://…/remoteEntry.js' } }
//   → { landing: 'landing@https://…/remoteEntry.js' }
const generatePluginRemotes = (
  remotes: ModuleFederationConfig['remotes'] = {},
  entryKey: keyof ModuleFederationRemote,
) =>
  Object.fromEntries(
    Object.entries(remotes).map(([remoteName, remote]) => {
      const remoteEntry = remote[entryKey];

      if (!remoteEntry) {
        throw new Error(
          `[bundler-webpack] Module Federation remote "${remoteName}" has no {${entryKey}}.`,
        );
      }

      return [remoteName, `${remoteName}@${remoteEntry}`];
    }),
  );

// NOTE: eager on the server only — nothing there is lazy-loaded for payload
// size, and the SSR server consumes the shared deps synchronously as soon as it
// starts. Required together with {webpackMode: "eager"} on the dynamic import
// in {ssr-server.entry.mts}: that one alone inlines the module, so the shared
// dep is consumed before negotiation (RUNTIME-006); this one alone leaves a
// separate chunk the server would then have to load. The browser keeps the
// non-eager deps — there the async negotiation is both correct and wanted.
const generateEagerShared = (shared: ModuleFederationConfig['shared'] = {}) =>
  Object.fromEntries(
    Object.entries(shared).map(([sharedName, sharedConfig]) => [
      sharedName,
      { ...sharedConfig, eager: true },
    ]),
  );

// Merge into the config passed to {generateEnvBasedWebpackConfig} — it is
// needed by every compilation of an app that uses Module Federation.
const generateModuleFederationCommonWebpackConfigFragment = ({
  name,
}: Pick<ModuleFederationConfig, 'name'>): Configuration =>
  merge(WATCH_OPTIONS__MODULE_FEDERATION__WEBPACK_CONFIG_CHUNK, {
    output: {
      // NOTE: must differ between every app on the page — webpack names its
      // global chunk array after it ({self.webpackChunk<uniqueName>}) and
      // defaults it to package.json {name}. Two apps on the same array: the
      // runtime loaded last takes it over, the other app's chunks register in
      // the wrong runtime, and hydration fails ("Cannot read properties of
      // undefined (reading 'call')").
      uniqueName: name,
    },
  });

// Merge into the webapp (browser) compilation — in CSR the only one there is.
// NOTE: a remote built for SSR also publishes {ssr-stylesheets.json} for its
// hosts' SSR (see RemoteStylesheetsPlugin). Not in CSR — there is no server
// HTML to link it from.
const generateModuleFederationWebappWebpackConfigFragment = ({
  name,
  exposes,
  remotes,
  shared,
  pluginOptions = {},
}: ModuleFederationConfig): Configuration => {
  const isSsrRemote =
    Boolean(exposes) && process.env.MS_CLI__WEBPACK_SERVE_MODE === 'ssr';

  return {
    plugins: [
      new ModuleFederationPlugin(
        merge(
          {
            name,
            ...(exposes && {
              filename: REMOTE_ENTRY_FILENAME__WEBAPP,
              exposes,
            }),
            ...(remotes && {
              remotes: generatePluginRemotes(remotes, 'webappEntry'),
            }),
            shared,
          },
          ASYNC_STARTUP__MODULE_FEDERATION_CONFIG_CHUNK,
          pluginOptions,
        ),
      ),
      ...(isSsrRemote ? [new RemoteStylesheetsPlugin()] : []),
    ],
  };
};

// Merge into an SSR HOST's server compilation (the one that renders pages and
// loads its remotes' server code). A remote that hosts nothing leaves its own
// server compilation as it is.
const generateModuleFederationSSRServerWebpackConfigFragment = ({
  name,
  remotes,
  shared,
  pluginOptions = {},
}: ModuleFederationConfig): Configuration => {
  if (!fs.existsSync(SSR_SERVER_ENTRY_PATH)) {
    throw new Error(
      `[bundler-webpack] an SSR host needs ${SSR_SERVER_ENTRY_PATH}, which imports ./ssr-server.config.mts dynamically ({webpackMode: "eager"}) — see generateModuleFederationSSRServerWebpackConfigFragment.`,
    );
  }

  const pluginRemotes = generatePluginRemotes(remotes, 'ssrServerEntry');
  const eagerShared = generateEagerShared(shared);

  return {
    // NOTE: 'async-node' (not plain 'node') is required by
    // {@module-federation/node}'s runtime plugin.
    target: 'async-node',
    entry: { 'ssr-server.config': SSR_SERVER_ENTRY_PATH },
    plugins: [
      new NodeFederationPlugin(
        merge(
          {
            name,
            remotes: pluginRemotes,
            shared: eagerShared,
            runtimePlugins: [NODE_FEDERATION_RUNTIME_PLUGIN_PATH],
          },
          pluginOptions,
        ),
        {},
      ),
      // NOTE: patches how async chunks the remotes split off are loaded in
      // Node — fetched over HTTP instead of read from this app's disk.
      new StreamingTargetPlugin({
        name,
        remotes: pluginRemotes,
        shared: eagerShared,
      }),
    ],
  };
};

// A REMOTE's extra compilation for SSR hosts: its exposed modules built as a
// CommonJS container ({ssr-remoteEntry.js}) a Node process can fetch and run.
// Returns a whole config (not a fragment): it reuses the SSR server base (its
// TS/SCSS loaders, CSS nulled out) WITHOUT its entry — the container must not
// build the app's own SSR server — and webpack-merge can't remove a key.
// Pass the same fragment as to {generateEnvBasedWebpackConfig}, extended with
// the server-facing {output.publicPath}.
const generateModuleFederationSSRContainerWebpackConfig = (
  extendedWebpackConfig: Configuration,
  {
    name,
    exposes,
    remotes,
    shared,
    pluginOptions = {},
  }: ModuleFederationConfig,
): Configuration => {
  if (!exposes) {
    throw new Error(
      `[bundler-webpack] "${name}" exposes nothing — an SSR container is only built for a remote.`,
    );
  }

  const { entry: _ssrServerEntry, ...ssrServerConfigWithoutEntry } =
    ssrServerEnvBasedConfig;
  const pluginRemotes = generatePluginRemotes(remotes, 'ssrServerEntry');

  return merge<Configuration>(
    ssrServerConfigWithoutEntry,
    extendedWebpackConfig,
    {
      entry: {},
      // NOTE: not the base's 'node' — a hardcoded 'node' target bakes in
      // filesystem {require()} chunk loading before StreamingTargetPlugin can
      // switch it to HTTP, which breaks loading an exposed module's async chunk
      // from another process. Matches how {@module-federation/node}'s own
      // server-side remote examples set up their compiler.
      target: false,
      output: {
        // NOTE: next to the browser build, not in dist/private — the host's
        // Node process fetches it over HTTP, so it has to be served.
        path: path.join(runtimePathById.dist, 'public'),
        library: { type: 'commonjs-module' },
      },
      experiments: { outputModule: false },
      plugins: [
        // NOTE: NodeFederationPlugin (not plain ModuleFederationPlugin) even
        // for a remote that consumes nothing: the plain one leaves the exposed
        // module's async chunk on filesystem loading, which fails for a
        // consumer in another process.
        new NodeFederationPlugin(
          merge(
            {
              name,
              filename: REMOTE_ENTRY_FILENAME__SSR,
              // NOTE: Node hosts fetch a remote entry and {require()}-wrap it,
              // reading {module.exports} — the browser container's bare
              // {var <name> = …} global evaporates once wrapped that way.
              library: { type: 'commonjs-module' },
              remotes: pluginRemotes,
              exposes,
              shared,
            },
            pluginOptions,
          ),
          {},
        ),
        new StreamingTargetPlugin({
          name,
          library: { type: 'commonjs-module' },
          remotes: pluginRemotes,
        }),
      ],
    },
  );
};

export {
  generateModuleFederationCommonWebpackConfigFragment,
  generateModuleFederationSSRContainerWebpackConfig,
  generateModuleFederationSSRServerWebpackConfigFragment,
  generateModuleFederationWebappWebpackConfigFragment,
};
