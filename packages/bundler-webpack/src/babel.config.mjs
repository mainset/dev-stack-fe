const BABEL_CONFIG__BROWSER = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '60',
          firefox: '60',
          safari: '11.1',
          edge: '17',
          ie: '11',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [],
};

// NOTE: the SSR server bundle runs on Node only (never IE11/old browsers), so it
// gets its own, much looser preset-env target instead of inheriting the browser
// one — otherwise server code would be needlessly downleveled to ES5.
const BABEL_CONFIG__NODE = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [],
};

export { BABEL_CONFIG__BROWSER, BABEL_CONFIG__NODE };
