import type { CookieOptions } from 'express';
import fs from 'fs';
import type { IncomingHttpHeaders } from 'http';
import path from 'path';
import { setTimeout } from 'timers/promises';
import { pathToFileURL } from 'url';

import { NODE_ENV, parseCliOptions } from '../../runtime/index.mjs';
// NOTE: imported directly, not via {utils/index.mjs} — that barrel also loads
// the process runner, whose ProcessManager installs signal handlers on import.
import { consoleColorize } from '../../utils/console-colorize.mjs';
import type { ExpressBaseAppConfig } from '../express-base-app/index.mjs';

// Step-1: parse CLI arguments

const options = parseCliOptions([
  {
    commanderFlags: '--ssrServerConfig <path>',
    description: 'Path to ./config/ssr-server.config.mts config file',
  },
]);

interface SSRRenderCookie {
  name: string;
  value: string;
  options?: CookieOptions;
}

// NOTE: a render function always resolves with this object rather than a bare
// HTML string, so that every render has one place to describe its response and
// {ssr-server.mts} has a single shape to handle. Only {html} is required — the
// rest defaults to what a plain {200} HTML response would have been.
interface SSRRenderResult {
  html: string;
  // NOTE: defaults to {200}. Needed when the render resolved a non-200 outcome
  // in-place instead of throwing — e.g. a React Router tree whose
  // {errorElement} catches a loader's {throw new Response(..., { status })} and
  // renders the boundary itself, so the status code never reaches Express
  // unless the render function reports it back.
  status?: number;
  // NOTE: applied with {res.set()} before sending — e.g. a {Cache-Control} or
  // {Content-Language} value the render resolved per request.
  headers?: Record<string, string | string[]>;
  // NOTE: applied with {res.cookie()} before sending — e.g. a locale or session
  // cookie the render decided on.
  cookies?: SSRRenderCookie[];
}

// NOTE: what a render function receives per request. {reqHeaders} carries the
// raw request headers so a render can resolve request-dependent things
// server-side — {Accept-Language} for locale selection, {Cookie} for a
// persisted preference. Named to match {reqUrl}: both describe the incoming
// request, as opposed to {SSRRenderResult.headers}, which is what goes back
// out in the response. Additive: renders that ignore it keep working
// unchanged.
interface SSRRenderParams {
  reqUrl: string;
  fullUrl: string;
  reqHeaders: IncomingHttpHeaders;
}

interface SSRConfigParams extends Partial<ExpressBaseAppConfig> {
  renderSSRContentByPath: Record<
    string, // URL path to render SSR content
    (_params: SSRRenderParams) => Promise<SSRRenderResult>
  >;
}

const isDevelopment = process.env.NODE_ENV === NODE_ENV.DEVELOPMENT;

const ssrServerConfigPath: string = options.ssrServerConfig;
const ssrServerConfigFileUrl = pathToFileURL(ssrServerConfigPath).href;

// NOTE: node keys its ESM module cache by the full URL *including* the query
// string, and there is no ESM equivalent of {delete require.cache}. So:
// - importing the same URL twice hands back the very same namespace object,
//   the file on disk is never re-read;
// - appending a fresh {?t=} makes it a cache miss, so node re-reads the bytes
//   and evaluates the module from scratch.
// !IMPORTANT: the catch is that every distinct URL stays in the module registry
// for the lifetime of the process — nothing evicts it. That is why cache
// busting is {development} only, and why it runs per rebuild rather than per
// request (see the watcher below): one leaked instance per rebuild, which is
// the same order of cost the {node --watch} process restart used to pay.
async function importSSRServerConfig(): Promise<SSRConfigParams> {
  const specifier = isDevelopment
    ? `${ssrServerConfigFileUrl}?t=${Date.now()}`
    : ssrServerConfigFileUrl;

  const importedSSRServerConfig: SSRConfigParams | undefined = (
    await import(specifier)
  ).default;

  // NOTE: webpack truncates the file before writing the new bundle, and an
  // import landing in between reads an empty module — valid ESM with no
  // exports, so it resolves to {undefined} instead of throwing. Throw like for
  // any other unreadable bundle, so callers keep (or wait for) a good one.
  if (!importedSSRServerConfig?.renderSSRContentByPath) {
    throw new Error(
      `"${ssrServerConfigPath}" has no default export with {renderSSRContentByPath} — most likely webpack is still writing it`,
    );
  }

  return importedSSRServerConfig;
}

// NOTE: the first change event fires as soon as webpack starts writing — give
// it a moment to finish before reading the file again.
const SSR_SERVER_CONFIG__REWRITE_SETTLE_MS = 100;

let isSSRServerConfigStale = false;
let ssrServerConfigReload: Promise<SSRConfigParams> | null = null;
let resolveNextSSRServerConfigChange: (() => void) | null = null;

if (isDevelopment) {
  // NOTE: why watch here instead of relying on {node --watch} (see web-app.mts):
  // {node --watch} only restarts on changes to files it loaded through the
  // module loader. Under Module Federation the compiled config is a thin entry
  // file plus separately content-hashed chunks, and webpack's OWN node chunk
  // loader pulls those chunks in with {fs.readFile} + {vm.runInThisContext} at
  // runtime — so {node} never learns about them, while the entry file's bytes
  // barely change even when the real render logic did. Their hashed names are
  // not knowable ahead of time either, which rules out watching specific files.
  // Watching the output directory ({output.path} of server.ssr.config.mts, so
  // the entry file and every chunk live here) catches a rebuild regardless of
  // which file webpack rewrote; the fresh import then gives the entry its own
  // {__webpack_require__} cache, so its chunk loads re-read whatever is
  // currently on disk.
  fs.watch(path.dirname(ssrServerConfigPath), { recursive: true }, () => {
    isSSRServerConfigStale = true;

    resolveNextSSRServerConfigChange?.();
    resolveNextSSRServerConfigChange = null;
  }).on('error', (error) => {
    console.error(
      '[mainset cli][ssr-server] Compiled config watcher failed, SSR renders will stay stale until restart:',
      error,
    );
  });
}

const waitForNextSSRServerConfigChange = () =>
  new Promise<void>((resolve) => {
    resolveNextSSRServerConfigChange = resolve;
  });

// NOTE: in {development}, a bundle that can't be imported at startup — webpack
// still writing it, or it was built from a half-finished edit — is a moment to
// wait out, not a reason to exit: retry after webpack's next write, the way
// {node --watch} used to by restarting the process. Production has no rebuild
// to wait for, so it still fails loudly.
async function importStartupSSRServerConfig(): Promise<SSRConfigParams> {
  isSSRServerConfigStale = false;

  try {
    return await importSSRServerConfig();
  } catch (error) {
    if (!isDevelopment) {
      throw error;
    }

    console.error(
      '[mainset cli][ssr-server] Failed to load compiled config, retrying after the next rebuild:',
      error,
    );

    // NOTE: a write that landed while the import was in flight has already
    // marked it stale — retry right away instead of waiting for another one.
    if (!isSSRServerConfigStale) {
      await waitForNextSSRServerConfigChange();
    }

    await setTimeout(SSR_SERVER_CONFIG__REWRITE_SETTLE_MS);

    return importStartupSSRServerConfig();
  }
}

// Step-2: load SSR server config at startup — Express routes are registered
// from this one (see ssr-server.mts), so the set of paths is fixed at boot and
// only each path's render function is refreshed afterwards.
let ssrServerConfig: SSRConfigParams = await importStartupSSRServerConfig();

const describeRenderSSRContentPaths = ({
  renderSSRContentByPath,
}: SSRConfigParams) => Object.keys(renderSSRContentByPath).join(', ');

const startupRenderSSRContentPaths =
  describeRenderSSRContentPaths(ssrServerConfig);
let lastRenderSSRContentPaths = startupRenderSSRContentPaths;

// NOTE: a reload only swaps the render functions behind the routes registered
// at startup, so a path added or renamed in ssr-server.config.mts needs a
// restart. Said once per change — every later rebuild reloads the same paths.
function warnOnRenderSSRContentPathsChange(
  reloadedSSRServerConfig: SSRConfigParams,
) {
  const reloadedRenderSSRContentPaths = describeRenderSSRContentPaths(
    reloadedSSRServerConfig,
  );

  if (reloadedRenderSSRContentPaths === lastRenderSSRContentPaths) {
    return;
  }

  lastRenderSSRContentPaths = reloadedRenderSSRContentPaths;

  if (reloadedRenderSSRContentPaths !== startupRenderSSRContentPaths) {
    console.warn(
      consoleColorize(
        'BRIGHT_YELLOW',
        `[mainset cli][ssr-server] {renderSSRContentByPath} paths changed to "${reloadedRenderSSRContentPaths}" — restart the dev server to register them; requests are still matched against "${startupRenderSSRContentPaths}".`,
      ),
    );
  }
}

async function reloadSSRServerConfig(): Promise<SSRConfigParams> {
  // NOTE: cleared before the import, so a rebuild landing while this one is
  // still in flight marks the result stale again instead of being swallowed.
  isSSRServerConfigStale = false;

  try {
    ssrServerConfig = await importSSRServerConfig();

    warnOnRenderSSRContentPathsChange(ssrServerConfig);
  } catch (error) {
    // NOTE: webpack may be mid-write — keep serving the last good config and
    // retry on the next request, instead of failing this one on a half-written
    // file.
    isSSRServerConfigStale = true;

    console.error(
      '[mainset cli][ssr-server] Failed to reload compiled config, keeping the previously loaded one:',
      error,
    );
  }

  return ssrServerConfig;
}

// NOTE: no {NODE_ENV} check needed here — {isSSRServerConfigStale} is only ever
// set by the {development} only watcher above, so production always takes the
// first return and pays nothing per request.
async function getSSRServerConfig(): Promise<SSRConfigParams> {
  if (!isSSRServerConfigStale) {
    return ssrServerConfig;
  }

  // NOTE: concurrent requests share a single reload — otherwise each in-flight
  // request would re-evaluate, and permanently register, its own copy of the
  // module graph.
  ssrServerConfigReload ??= reloadSSRServerConfig().finally(() => {
    ssrServerConfigReload = null;
  });

  return ssrServerConfigReload;
}

export { getSSRServerConfig, ssrServerConfig };
export type { SSRConfigParams, SSRRenderParams, SSRRenderResult };
