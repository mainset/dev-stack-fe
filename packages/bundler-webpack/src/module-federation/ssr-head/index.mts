// Runtime helpers for an SSR host's server code — kept apart from
// `@mainset/bundler-webpack/module-federation` (build-time: webpack, Module
// Federation's plugins) so importing them doesn't pull any of that into the
// server bundle. Import nothing here that isn't safe to run in that server.
export { buildPreloadAfterPaintCode } from './preload-after-paint.mjs';
export { buildRemoteHeadTags } from './remote-head-tags.mjs';
