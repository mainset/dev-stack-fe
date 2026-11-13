// The inline script that preloads a page's startup scripts — a host's own
// (PreloadStartupScriptsPlugin, at build time) and its remotes'
// (buildRemoteHeadTags, per request): both build theirs with this.
//
// Requested together, but only once the page's content has painted — not
// with the HTML (plain <link rel="preload"> tags). The first paint needs the
// connection for itself (fonts, the hero image); the scripts only matter
// after it, to make the page work. Requested with the HTML, they compete with
// it — and Lighthouse's mobile simulation counts every one of them as holding
// the page's largest paint (measured on a host with 12 of them: simulated LCP
// 2.7s → 3.3s, though the real one didn't move).
// "Painted" is the browser's own first-contentful-paint — not just the first
// frame: text waiting for its web font paints later than the frames drawn
// before it. Where that isn't reported (older Safari), two frames instead —
// the second is drawn after the first is on screen.
//
// NOTE: <link rel="preload" as="script">, not <script>: downloaded, not run —
// the runtime still runs each chunk when it needs it, and finds it downloaded.
// NOTE: no `crossorigin` — webpack and the federation runtime load chunks
// with plain <script> tags (no output.crossOriginLoading), and a preload is
// only reused by a request of the same CORS mode.
// NOTE: a page opened in a background tab paints nothing, so this waits —
// its scripts load one after another as before, when the runtime asks.
// NOTE: an inline script — a Content-Security-Policy with `script-src` must
// allow it (e.g. by hash).
const PRELOAD_AFTER_PAINT_SOURCE = `function(u){
  function go(){u.forEach(function(h){var l=document.createElement('link');l.rel='preload';l.as='script';l.href=h;document.head.appendChild(l)})}
  var P=window.PerformanceObserver;
  if(P&&P.supportedEntryTypes&&P.supportedEntryTypes.indexOf('paint')>=0){
    new P(function(list,observer){if(list.getEntriesByName('first-contentful-paint').length){observer.disconnect();go()}}).observe({type:'paint',buffered:true});
  }else{requestAnimationFrame(function(){requestAnimationFrame(go)})}
}`.replace(/\n\s*/g, '');

// The script's code, without the <script> element around it.
const buildPreloadAfterPaintCode = (urls: string[]): string =>
  // `<` escaped: nothing in a URL may close the <script> element early.
  `(${PRELOAD_AFTER_PAINT_SOURCE})(${JSON.stringify(urls).replace(
    /</g,
    '\\u003c',
  )})`;

export { buildPreloadAfterPaintCode };
