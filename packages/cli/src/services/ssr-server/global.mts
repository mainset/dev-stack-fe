type GlobalBrowser = {
  window?: boolean;
  init: () => void;
};

const global: GlobalBrowser = {
  init() {
    if (typeof window === 'undefined') {
      global.window = false;
    }
  },
};

export default global;
