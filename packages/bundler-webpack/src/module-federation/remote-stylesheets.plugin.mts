import type { Compiler } from 'webpack';

import { SSR_STYLESHEETS_FILENAME } from './module-federation.chunk.mjs';

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
// Output ({ssr-stylesheets.json}), URLs exactly `publicPath + file` (so
// output.publicPath must be absolute, not 'auto'), which is what webpack's CSS
// loader compares against — a <link> with the same href is reused after
// hydration instead of being fetched twice:
//   { "./routes": ["https://cdn.example/landing/prod/css/806.0116.min.css"] }
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
          // PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER (3000) — this has to run after.
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

          const stylesheetsByExpose = Object.fromEntries(
            exposes.map(({ path, assets }) => [
              path,
              assets.css.sync.map((file) => `${metaData.publicPath}${file}`),
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
