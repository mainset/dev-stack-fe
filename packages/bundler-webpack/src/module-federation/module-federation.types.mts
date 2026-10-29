import type { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

// NOTE: derived from the plugin's own constructor instead of importing
// {@module-federation/sdk} — that package is only a dependency of
// {@module-federation/enhanced}, not of this one, so it is not resolvable here.
type ModuleFederationPluginOptions = ConstructorParameters<
  typeof ModuleFederationPlugin
>[0];

type ModuleFederationSharedObject = Exclude<
  NonNullable<ModuleFederationPluginOptions['shared']>,
  unknown[]
>;

// NOTE: object form only ({ react: { singleton: true } }) — the SSR server
// compilation has to rewrite every entry ({eager: true}), which the array and
// string shorthands can't carry.
type ModuleFederationSharedConfig = Exclude<
  ModuleFederationSharedObject[string],
  string
>;

// NOTE: one remote, two containers — the browser loads `webappEntry`
// ({remoteEntry.js}), an SSR host's Node process loads `ssrServerEntry`
// ({ssr-remoteEntry.js}). Two URLs because they are often reachable at
// different addresses: a CDN for browsers, an internal hostname for servers.
type ModuleFederationRemote = {
  webappEntry: string;
  ssrServerEntry?: string;
};

type ModuleFederationConfig = {
  name: string;
  // e.g. { './routes': path.join(runtimePathById.src, 'routes.tsx') }
  exposes?: Record<string, string>;
  // Keyed by the remote's own Module Federation {name}.
  remotes?: Record<string, ModuleFederationRemote>;
  shared?: Record<string, ModuleFederationSharedConfig>;
  // Merged into the options of EVERY Module Federation plugin generated from
  // this config — the place for anything not covered above (e.g. {dts}).
  pluginOptions?: Partial<ModuleFederationPluginOptions>;
};

export type {
  ModuleFederationConfig,
  ModuleFederationPluginOptions,
  ModuleFederationRemote,
  ModuleFederationSharedConfig,
};
