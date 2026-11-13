import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Compiler } from 'webpack';

const PLUGIN_NAME = 'InlineStylesheetsPlugin';

// Swaps the <link rel="stylesheet"> tags html-webpack-plugin injects for this
// build's own CSS for <style data-href> tags with the file's text, so the page
// has no stylesheet request holding its first paint — one that, with the CSS
// on a CDN, also waits for a connection to another origin.
//
// `data-href` is the URL the <link> had: webpack's CSS loader looks for a
// <link href> or <style data-href> with a chunk's URL before requesting it, so
// a stylesheet already inlined is never fetched again. The CSS files are still
// emitted, for anything else that asks for them.
//
// NOTE: the URLs inside the CSS (fonts, images) resolve against the page once
// inlined, not against the stylesheet — fine with an absolute
// output.publicPath, which is what puts them in the CSS.
// Trade-off: the browser can no longer cache the CSS apart from the page — it
// comes with every HTML document. Worth it for a small stylesheet on pages
// that are mostly a first visit; for a big one, keep the <link>.
// Opt-in: add it to the webapp compilation's plugins.
class InlineStylesheetsPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      HtmlWebpackPlugin.getCompilationHooks(
        compilation,
      ).alterAssetTagGroups.tap(PLUGIN_NAME, (assetTagGroups) => {
        const { publicPath } = assetTagGroups;

        const inlineStylesheet = (tag: HtmlWebpackPlugin.HtmlTagObject) => {
          const { rel, href } = tag.attributes;

          if (
            tag.tagName !== 'link' ||
            rel !== 'stylesheet' ||
            typeof href !== 'string' ||
            !href.startsWith(publicPath)
          ) {
            return tag;
          }

          const stylesheetAsset = compilation.getAsset(
            href.slice(publicPath.length),
          );

          if (!stylesheetAsset) {
            return tag;
          }

          return HtmlWebpackPlugin.createHtmlTagObject(
            'style',
            { 'data-href': href },
            // NOTE: the only text that would end the <style> element early.
            stylesheetAsset.source
              .source()
              .toString()
              .replace(/<\/style/gi, '<\\/style'),
          );
        };

        return {
          ...assetTagGroups,
          headTags: assetTagGroups.headTags.map(inlineStylesheet),
          bodyTags: assetTagGroups.bodyTags.map(inlineStylesheet),
        };
      });
    });
  }
}

export { InlineStylesheetsPlugin };
