declare module '*.module.scss' {
  const styles: { [className: string]: string };
  export = styles;
}

declare module '*.source.svg' {
  const content: string;
  export default content;
}
