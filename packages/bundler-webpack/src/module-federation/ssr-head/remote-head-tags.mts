import type {
  SSRRemote,
  SSRScriptsByExpose,
  SSRStylesheet,
  SSRStylesheetsByExpose,
} from '../module-federation.types.mjs';
import { buildPreloadAfterPaintCode } from './preload-after-paint.mjs';

// NOTE: defined by generateModuleFederationSSRServerWebpackConfigFragment's
// DefinePlugin — only in an SSR host's server build. Anywhere else it's
// undeclared, which `typeof` tolerates: no remotes, no tags.
declare const MS_MODULE_FEDERATION__SSR_REMOTES: SSRRemote[] | undefined;

const readSSRRemotes = (): SSRRemote[] =>
  typeof MS_MODULE_FEDERATION__SSR_REMOTES === 'undefined'
    ? []
    : MS_MODULE_FEDERATION__SSR_REMOTES;

// What a remote's {ssr-stylesheets.json} may hold — see buildStylesheetTag.
type LegacySSRStylesheetsByExpose = Record<
  string,
  SSRStylesheetsByExpose[string] | string[]
>;

const LOG_PREFIX = '[bundler-webpack] buildRemoteHeadTags:';

// A file the remote doesn't publish (404 — e.g. built with an older
// @mainset/bundler-webpack) is not an error worth repeating per request: it's
// remembered as empty. Anything else (the remote unreachable, a 5xx) isn't
// remembered — the next request tries again.
class NotPublishedError extends Error {}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (response.status === 404) throw new NotPublishedError(`HTTP 404`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
};

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Inlined, not linked: a <link> holds the first paint until the file arrives
// — from the remote's origin (a CDN), so a new connection first — which made
// it the slowest part of the first paint. Inline, the page paints as soon as
// its HTML is in.
// `data-href` is the URL webpack's CSS runtime computes (publicPath + file),
// so after hydration it finds the stylesheet here and doesn't request the
// file again.
// NOTE: a plain URL is what remotes built with @mainset/bundler-webpack
// <0.4.3 wrote (no CSS text) — linked as before.
const buildStylesheetTag = (stylesheet: SSRStylesheet | string) => {
  if (typeof stylesheet === 'string') {
    return `<link rel="stylesheet" href="${escapeAttribute(stylesheet)}" />`;
  }

  // NOTE: the only text that would end the <style> element early.
  const content = stylesheet.content.replace(/<\/style/gi, '<\\/style');

  return `<style data-href="${escapeAttribute(stylesheet.href)}">${content}</style>`;
};

// The remote's remoteEntry.js and each exposed module's scripts, preloaded
// once the page has painted — instead of the browser finding them one after
// another as each one runs (see preload-after-paint.mts).
const buildScriptsPreloadTag = (
  remote: SSRRemote,
  scriptsByExpose: SSRScriptsByExpose,
) => {
  const urls = [
    remote.remoteEntryUrl,
    ...new Set(Object.values(scriptsByExpose).flat()),
  ];

  return `<script>${buildPreloadAfterPaintCode(urls)}</script>`;
};

// Per process, not per page: one request per remote and file, and the tags
// built once. Safe as long as the hosts are restarted when a remote is
// deployed — the same assumption as for the remote's server code, which a
// host never re-fetches either.
const tagsPromiseByUrl = new Map<string, Promise<string[]>>();

const loadTags = <T,>(
  url: string,
  buildTags: (data: T) => string[],
  whatIsMissing: string,
): Promise<string[]> => {
  const cached = tagsPromiseByUrl.get(url);

  if (cached) return cached;

  const tagsPromise = fetchJson<T>(url)
    .then(buildTags)
    .catch((error: Error) => {
      if (error instanceof NotPublishedError) {
        console.warn(
          `${LOG_PREFIX} ${url} not published — ${whatIsMissing}. Rebuild the remote with a current @mainset/bundler-webpack.`,
        );
      } else {
        tagsPromiseByUrl.delete(url);
        console.error(
          `${LOG_PREFIX} ${url} unavailable (${error.message}) — ${whatIsMissing}.`,
        );
      }

      return [];
    });

  tagsPromiseByUrl.set(url, tagsPromise);

  return tagsPromise;
};

/**
 * The tags an SSR host puts in its pages' `<head>` for its Module Federation
 * remotes — for each one, its stylesheets (inlined) and a preload of its
 * startup scripts, from the files the remote's build publishes next to its
 * server build (SSR_STYLESHEETS_FILENAME, SSR_SCRIPTS_FILENAME). Without
 * them, the remote's markup paints unstyled until its JS has loaded, and its
 * scripts load one after another.
 *
 * Which remotes, and where their files are, come from the host's `remotes`
 * config — nothing to pass. Call it from the host's SSR config, per page:
 *
 *   const headTags = await buildRemoteHeadTags();
 *   html.replace('</head>', () => `${headTags.join('\n')}</head>`);
 *
 * NOTE: every exposed module of every remote, on every page — right when the
 * host imports all its remotes' modules on every page at startup (e.g. their
 * route trees). If some pages don't, they get unused CSS and preloads.
 * NOTE: never throws — a page without these is slower or briefly unstyled,
 * which is no reason to turn it into a 500. Failures are logged.
 */
const buildRemoteHeadTags = async (): Promise<string[]> => {
  const tagsByRemote = await Promise.all(
    readSSRRemotes().map(async (remote) => {
      const [preloadTags, stylesheetTags] = await Promise.all([
        loadTags<SSRScriptsByExpose>(
          remote.scriptsUrl,
          (scriptsByExpose) => [
            buildScriptsPreloadTag(remote, scriptsByExpose),
          ],
          `"${remote.name}"'s scripts aren't preloaded, the page starts slower`,
        ),
        loadTags<LegacySSRStylesheetsByExpose>(
          remote.stylesheetsUrl,
          (stylesheetsByExpose) =>
            Object.values(stylesheetsByExpose).flat().map(buildStylesheetTag),
          `"${remote.name}"'s pages paint unstyled until its JS loads`,
        ),
      ]);

      return [...preloadTags, ...stylesheetTags];
    }),
  );

  return tagsByRemote.flat();
};

export { buildRemoteHeadTags };
