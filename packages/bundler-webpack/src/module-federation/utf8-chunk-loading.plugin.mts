import type { Compiler } from 'webpack';

const PLUGIN_NAME = 'Utf8ChunkLoadingPlugin';

// What {@module-federation/node}'s chunk loader is recognised by, in the
// runtime code StreamingTargetPlugin generates — and the line it gets wrong.
const HTTP_VM_STRATEGY_MARKER = 'function httpVmStrategy(';
const DATA_HANDLER = 'res.on("data", (chunk) => {';
// Same line, with the response decoded as UTF-8 by Node itself.
const UTF8_DATA_HANDLER = `res.setEncoding("utf8"); ${DATA_HANDLER}`;

// TODO: remove this plugin (and its two uses in module-federation.fragment.mts)
// once {@module-federation/node} decodes chunks correctly — the build warning
// below says when: it fires as soon as the loader no longer has the line this
// plugin patches. Bug in {@module-federation/node} 2.7.53 (latest as of
// 2026-11-13), src/filesystem/stratagies.ts, httpVmStrategy.
//
// The bug: in Node, Module Federation loads a remote's chunks over HTTP and
// builds each file's text with `data += chunk.toString()` — decoding every
// network chunk on its own. A UTF-8 character whose bytes land in two chunks
// is cut in half and becomes two U+FFFD (`��`). Which character that hits
// depends only on where the chunk boundaries fall in the file, so any change
// to a remote's code can move it onto text — e.g. a Cyrillic letter in a
// translation, which then differs between the server's HTML and the
// browser's render: a hydration error, and the page re-rendered in the
// browser.
//
// The fix: `res.setEncoding("utf8")` before the data handler. Node then hands
// the handler strings, decoded with the character boundaries kept across
// chunks, and `chunk.toString()` returns them as they are.
//
// Done on the generated runtime code (StreamingTargetPlugin embeds the
// loader's source text into it), before webpack hashes it, so the patched
// code is what the content hash describes.
class Utf8ChunkLoadingPlugin {
  apply(compiler: Compiler) {
    const { WebpackError } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      let hasWarned = false;

      compilation.hooks.runtimeModule.tap(PLUGIN_NAME, (runtimeModule) => {
        const generate = runtimeModule.generate.bind(runtimeModule);

        runtimeModule.generate = () => {
          const code = generate();

          if (!code || !code.includes(HTTP_VM_STRATEGY_MARKER)) return code;

          // NOTE: a loader that sets an encoding itself is fixed upstream —
          // left alone, and the warning below says so.
          if (code.includes(DATA_HANDLER) && !code.includes('setEncoding(')) {
            return code.replace(DATA_HANDLER, UTF8_DATA_HANDLER);
          }

          if (!hasWarned) {
            hasWarned = true;
            compilation.warnings.push(
              new WebpackError(
                `[bundler-webpack] ${PLUGIN_NAME}: @module-federation/node's httpVmStrategy changed (the line this workaround patches is gone, or it sets an encoding itself) — check whether it decodes chunks as UTF-8 now, and if so remove ${PLUGIN_NAME}.`,
              ),
            );
          }

          return code;
        };
      });
    });
  }
}

export { Utf8ChunkLoadingPlugin };
