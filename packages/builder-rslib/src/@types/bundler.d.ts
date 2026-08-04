// NOTE: kept in sync with @mainset/bundler-webpack/src/@types/bundler.d.ts —
// declaring a pattern the bundler does not resolve makes an import type-check
// and then fail at build time.
// !IMPORTANT: TypeScript picks a wildcard by longest prefix, and every pattern
// below has an empty prefix — so ties are won by the FIRST declaration. The
// specific patterns must stay above the generic ones, otherwise
// {styles.module.css} resolves as a plain stylesheet and {icon.source.svg} as a
// {*.svg} asset URL.

// CSS Modules: map of local class name to the generated one
declare module '*.module.css' {
  const styles: { [className: string]: string };
  export = styles;
}
declare module '*.module.scss' {
  const styles: { [className: string]: string };
  export = styles;
}
declare module '*.module.sass' {
  const styles: { [className: string]: string };
  export = styles;
}

// NOTE: original, unprocessed SVG content
declare module '*.source.svg' {
  const content: string;
  export default content;
}

// NOTE: plain stylesheets are imported for their side effect only
// ({import './styles.css'}), so they expose no meaningful binding. They need a
// declaration at all only once {noUncheckedSideEffectImports} is enabled —
// TypeScript does not check bare side-effect imports by default.
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

// NOTE: emits the file and exports its public URL
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
