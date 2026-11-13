import type { Compiler } from 'webpack';

import { SSR_STYLESHEETS_FILENAME } from './module-federation.chunk.mjs';
import type { SSRStylesheetsByExpose } from './module-federation.types.mjs';

const PLUGIN_NAME = 'RemoteStylesheetsPlugin';
const MODULE_FEDERATION_MANIFEST_FILENAME = 'mf-manifest.json';

// NOTE: only the part of Module Federation's manifest this plugin reads.
type ModuleFederationManifest = {
  metaData: { publicPath: string };
  exposes: { path: string; assets: { css: { sync: string[] } } }[];
};

// Records, per exposed module, the stylesheets an SSR host must have in its
// page <head> before that module's markup is first painted — the file the
// host's SSR reads to avoid a flash of unstyled content (FOUC).
//
// Why a host needs it: the exposed module's CSS lives in the remote's async
// chunk and is only requested by Module Federation's browser runtime AFTER JS
// runs, while the host's SSR HTML already carries the markup. Nothing in that
// HTML points at the CSS, so the page paints unstyled until the chunk loads.
//
// NOTE: derived from Module Federation's own manifest (its `assets.css.sync`
// per expose) rather than re-walking the chunk graph, so "which CSS belongs to
// which expose" stays MF's answer. Not shipped as-is because the manifest is
// not a stable contract: the webapp and the SSR container are two
// compilations writing the SAME `mf-manifest.json` into the same folder (last
// one wins), and the SSR one has no CSS at all (CSS is nulled out on the
// server). Runs on the WEBAPP compilation only.
//
// Output ({ssr-stylesheets.json}), per stylesheet its URL and its text:
//   { "./routes": [{ "href": "https://cdn.example/landing/prod/css/806.0116.min.css", "content": "…" }] }
// - `href` is exactly `publicPath + file` (so output.publicPath must be
//   absolute, not 'auto'): what webpack's CSS loader compares against. A
//   <link href> or a <style data-href> with that URL counts as the chunk's CSS
//   being on the page already, so it isn't fetched again after hydration.
// - `content` lets the host inline the CSS (<style data-href>) instead of
//   linking it: a <link> holds first paint until the file arrives from the
//   remote's origin, an extra connection on the critical path. It is the
//   file's final text, so the URLs in it must be absolute as well (they are,
//   with an absolute publicPath): inlined, they resolve against the page,
//   not against the stylesheet.
//
// NOTE: only `sync` CSS — what the module needs to render. CSS of its lazily
// loaded chunks (`async`) is requested when that chunk is.
class RemoteStylesheetsPlugin {
  apply(compiler: Compiler) {
    const { Compilation, WebpackError, sources } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          // NOTE: Module Federation emits its manifest at
          // PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER (3000) — this has to run
          // after. Late enough, too, for the stylesheets to be final.
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const manifestAsset = compilation.getAsset(
            MODULE_FEDERATION_MANIFEST_FILENAME,
          );

          if (!manifestAsset) {
            compilation.errors.push(
              new WebpackError(
                `${PLUGIN_NAME}: ${MODULE_FEDERATION_MANIFEST_FILENAME} was not emitted — is Module Federation's manifest disabled?`,
              ),
            );
            return;
          }

          const { metaData, exposes }: ModuleFederationManifest = JSON.parse(
            manifestAsset.source.source().toString(),
          );

          const readStylesheet = (file: string) => {
            const stylesheetAsset = compilation.getAsset(file);

            if (!stylesheetAsset) {
              compilation.errors.push(
                new WebpackError(
                  `${PLUGIN_NAME}: ${MODULE_FEDERATION_MANIFEST_FILENAME} lists ${file}, which was not emitted.`,
                ),
              );
            }

            return {
              href: `${metaData.publicPath}${file}`,
              content: stylesheetAsset?.source.source().toString() ?? '',
            };
          };

          const stylesheetsByExpose: SSRStylesheetsByExpose =
            Object.fromEntries(
              exposes.map(({ path, assets }) => [
                path,
                assets.css.sync.map(readStylesheet),
              ]),
            );

          compilation.emitAsset(
            SSR_STYLESHEETS_FILENAME,
            new sources.RawSource(
              `${JSON.stringify(stylesheetsByExpose, null, 2)}\n`,
            ),
          );
        },
      );
    });
  }
}

export { RemoteStylesheetsPlugin };
