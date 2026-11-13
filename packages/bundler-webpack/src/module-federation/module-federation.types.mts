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

// The contents of a remote's {ssr-stylesheets.json} (SSR_STYLESHEETS_FILENAME),
// keyed by exposed module — see RemoteStylesheetsPlugin.
type SSRStylesheet = {
  // The URL webpack's CSS loader knows the stylesheet by: use it as the
  // <link href>, or as the <style data-href> when inlining `content`.
  href: string;
  content: string;
};

type SSRStylesheetsByExpose = Record<string, SSRStylesheet[]>;

// The contents of a remote's {ssr-scripts.json} (SSR_SCRIPTS_FILENAME): per
// exposed module, the URLs of the browser scripts it needs — see
// RemoteScriptsPlugin.
type SSRScriptsByExpose = Record<string, string[]>;

// What an SSR host's server knows about each of its remotes, to put their
// stylesheets and script preloads in its pages' <head> — defined at build time
// by generateModuleFederationSSRServerWebpackConfigFragment from the `remotes`
// config, read by `buildRemoteHeadTags` (./ssr-head).
type SSRRemote = {
  name: string;
  // The URL browsers load the remote's {remoteEntry.js} from (`webappEntry`).
  remoteEntryUrl: string;
  // Both next to the remote's server build (`ssrServerEntry`).
  stylesheetsUrl: string;
  scriptsUrl: string;
};

export type {
  ModuleFederationConfig,
  ModuleFederationPluginOptions,
  ModuleFederationRemote,
  ModuleFederationSharedConfig,
  SSRRemote,
  SSRScriptsByExpose,
  SSRStylesheet,
  SSRStylesheetsByExpose,
};
