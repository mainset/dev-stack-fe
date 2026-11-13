import type { Compiler } from 'webpack';

import { SSR_SCRIPTS_FILENAME } from './module-federation.chunk.mjs';
import type { SSRScriptsByExpose } from './module-federation.types.mjs';

const PLUGIN_NAME = 'RemoteScriptsPlugin';
const MODULE_FEDERATION_MANIFEST_FILENAME = 'mf-manifest.json';

// NOTE: only the part of Module Federation's manifest this plugin reads.
type ModuleFederationManifest = {
  metaData: { publicPath?: string };
  exposes: { path: string; assets: { js: { sync: string[] } } }[];
};

// Records, per exposed module, the URLs of the browser scripts it needs to
// run — the file an SSR host's server reads to have the browser preload them
// with the page (buildRemoteHeadTags, ./ssr-head).
//
// Why a host needs it: the browser otherwise only finds a remote's scripts
// one after another — its remoteEntry.js once the host's own startup code
// runs, then each exposed module's chunks once the host imports it. Every
// step is another round trip; on a phone, seconds between the page painting
// (server-rendered) and it working (hydrated).
//
// The scripts' counterpart to RemoteStylesheetsPlugin, made the same way and
// for the same reasons: from Module Federation's own manifest (its
// `assets.js.sync` per expose), read from THIS compilation — never
// `mf-manifest.json` on disk, which the SSR container's compilation
// overwrites with its server chunks. Runs on the WEBAPP compilation only.
//
// Output ({ssr-scripts.json}):
//   { "./routes": ["https://cdn.example/landing/prod/js/167.c183.min.js", …] }
// URLs are exactly `publicPath + file` — what the remote's runtime requests,
// so a preload of them is what it then finds (output.publicPath must be a
// real one, not 'auto').
//
// NOTE: only `sync` scripts — what the module needs to run. Its lazily loaded
// chunks (`async`) are requested when they're needed.
class RemoteScriptsPlugin {
  apply(compiler: Compiler) {
    const { Compilation, WebpackError, sources } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          // NOTE: Module Federation emits its manifest at
          // PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER (3000) — this has to run
          // after, with the file names final.
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

          // NOTE: 'auto' is only worked out in the browser — no URL to give.
          // A warning, not an error: the hosts just don't preload, as before.
          if (!metaData.publicPath || metaData.publicPath === 'auto') {
            compilation.warnings.push(
              new WebpackError(
                `${PLUGIN_NAME}: output.publicPath is "auto" — ${SSR_SCRIPTS_FILENAME} needs a real one to list URLs, so the hosts won't preload this remote's scripts.`,
              ),
            );
            return;
          }

          const { publicPath } = metaData;
          const scriptsByExpose: SSRScriptsByExpose = Object.fromEntries(
            exposes.map(({ path, assets }) => [
              path,
              assets.js.sync.map((file) => `${publicPath}${file}`),
            ]),
          );

          compilation.emitAsset(
            SSR_SCRIPTS_FILENAME,
            new sources.RawSource(
              `${JSON.stringify(scriptsByExpose, null, 2)}\n`,
            ),
          );
        },
      );
    });
  }
}

export { RemoteScriptsPlugin };
