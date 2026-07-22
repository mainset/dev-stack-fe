import type { HtmlTagObject } from 'html-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Compilation, Compiler } from 'webpack';

/**
 * HtmlPreloadCssWebpackPlugin
 * Removes blinking CSS during SSR (Server-Side Rendering) by preloading CSS files.
 *
 * This plugin modifies the HTML output to add preload tags for CSS files.
 * It hooks into the HtmlWebpackPlugin to alter the asset tag groups.
 *
 * The tag format will be:
 * <link href="css/main.02c3511e.min.css" rel="preload" as="style" />
 *
 * Added before:
 * <link href="css/main.02c3511e.min.css" rel="stylesheet" />
 */
class HtmlPreloadCssWebpackPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'HtmlPreloadCssWebpackPlugin',
      (compilation: Compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          'HtmlPreloadCssWebpackPlugin',
          (data, cb) => {
            const newHeadTags: HtmlTagObject[] = [];

            data.headTags.forEach((tag) => {
              if (
                tag.tagName === 'link' &&
                tag.attributes?.rel === 'stylesheet'
              ) {
                newHeadTags.push({
                  ...tag,
                  attributes: {
                    ...tag.attributes,
                    rel: 'preload',
                    as: 'style',
                  },
                });
              }

              newHeadTags.push(tag);
            });

            data.headTags = newHeadTags;
            cb(null, data);
          },
        );
      },
    );
  }
}

export { HtmlPreloadCssWebpackPlugin };
