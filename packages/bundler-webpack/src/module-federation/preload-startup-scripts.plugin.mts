import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Chunk, ChunkGroup, Compilation, Compiler, Module } from 'webpack';

import { buildPreloadAfterPaintCode } from './ssr-head/preload-after-paint.mjs';

const PLUGIN_NAME = 'PreloadStartupScriptsPlugin';

// NOTE: only the parts of Module Federation's modules this plugin reads.
// `_name` is internal to its ProvideSharedModule (@module-federation/enhanced
// 2.x) — if a release renames it, the shared libraries are just left out (a
// build warning says so) and the page works as before, only slower.
type ProvideSharedModule = Module & { _name?: unknown };
type ConsumeSharedModule = Module & { options?: { shareKey?: string } };

// Preloads the app's own scripts its page needs before it can start
// (hydrate) — not just the entry, which html-webpack-plugin already adds —
// from a small inline script in the page's <head>, once the page has painted
// (see ./ssr-head/preload-after-paint.mts for why then).
//
// Why: the browser otherwise only learns of each script by running the one
// before it — entry → bootstrap (Module Federation's async boundary) → the
// app → the shared libraries (react, …). Every step is another round trip;
// on a phone, seconds between the page painting and it working. Preloaded,
// they're requested together. (A host's remotes' scripts: buildRemoteHeadTags.)
//
// Which scripts — read from the build's chunk graph, so the list is always
// this build's real file names:
// - from each entry, the dynamic imports marked `webpackPreload: true` (the
//   app's startup chain — e.g. `import(/* webpackPreload: true */
//   './bootstrap')`), and theirs in turn. Only marked ones: an app's other
//   dynamic imports (analytics, chat, …) must stay off the startup path.
//   Nothing marked — nothing preloaded beyond what the entry itself needs.
// - the shared libraries those chunks consume, as the chunk the app PROVIDES
//   them in — what the federation runtime loads when the app is the host —
//   not the chunk webpack keeps as the consumer's fallback.
//
// Runs wherever html-webpack-plugin builds a page (the webapp compilation),
// on every Module Federation app — see the webapp fragment.
const collectStartupScripts = (compilation: Compilation) => {
  const { chunkGraph, moduleGraph } = compilation;

  // shareKey → the chunk groups the app provides that shared library in.
  const providedGroupsByShareKey = new Map<string, ChunkGroup[]>();
  let hasConsumedSharedLibraries = false;

  for (const module of compilation.modules) {
    if (module.type === 'consume-shared-module') {
      hasConsumedSharedLibraries = true;
    }

    const shareKey = (module as ProvideSharedModule)._name;

    if (module.type !== 'provide-module' || typeof shareKey !== 'string') {
      continue;
    }

    const groups = module.blocks
      .map((block) => chunkGraph.getBlockChunkGroup(block))
      .filter((group): group is ChunkGroup => Boolean(group));

    providedGroupsByShareKey.set(shareKey, [
      ...(providedGroupsByShareKey.get(shareKey) ?? []),
      ...groups,
    ]);
  }

  const visitedGroups = new Set<ChunkGroup>();
  const files = new Set<string>();

  // The chunk groups a chunk's shared libraries are provided in.
  const findProvidedGroups = (chunk: Chunk) =>
    [...chunkGraph.getChunkModulesIterable(chunk)].flatMap((module) => {
      const shareKey = (module as ConsumeSharedModule).options?.shareKey;

      return module.type === 'consume-shared-module' && shareKey
        ? (providedGroupsByShareKey.get(shareKey) ?? [])
        : [];
    });

  const visit = (chunkGroup: ChunkGroup) => {
    if (visitedGroups.has(chunkGroup)) return;
    visitedGroups.add(chunkGroup);

    chunkGroup.chunks.forEach((chunk) => {
      chunk.files.forEach((file) => {
        if (file.endsWith('.js')) files.add(file);
      });
      findProvidedGroups(chunk).forEach(visit);
    });

    const { preload = [] } = chunkGroup.getChildrenByOrders(
      moduleGraph,
      chunkGraph,
    );

    (preload as ChunkGroup[]).forEach(visit);
  };

  compilation.entrypoints.forEach(visit);

  // The entries' own scripts are on the page already.
  compilation.entrypoints.forEach((entrypoint) =>
    entrypoint.getFiles().forEach((file) => files.delete(file)),
  );

  return {
    files: [...files],
    isMissingSharedLibraries:
      hasConsumedSharedLibraries && providedGroupsByShareKey.size === 0,
  };
};

class PreloadStartupScriptsPlugin {
  apply(compiler: Compiler) {
    const { WebpackError } = compiler.webpack;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      HtmlWebpackPlugin.getCompilationHooks(
        compilation,
      ).alterAssetTagGroups.tap(PLUGIN_NAME, (assetTagGroups) => {
        const { files, isMissingSharedLibraries } =
          collectStartupScripts(compilation);

        if (isMissingSharedLibraries) {
          compilation.warnings.push(
            new WebpackError(
              `${PLUGIN_NAME}: the shared libraries aren't preloaded — none of Module Federation's provide-modules could be read. Has @module-federation/enhanced changed its internals?`,
            ),
          );
        }

        if (!files.length) return assetTagGroups;

        const preloadTag = HtmlWebpackPlugin.createHtmlTagObject(
          'script',
          {},
          buildPreloadAfterPaintCode(
            files.map((file) => `${assetTagGroups.publicPath}${file}`),
          ),
        );

        return {
          ...assetTagGroups,
          // First in <head>, so it's waiting for the first paint however
          // early that comes.
          headTags: [preloadTag, ...assetTagGroups.headTags],
        };
      });
    });
  }
}

export { PreloadStartupScriptsPlugin };
