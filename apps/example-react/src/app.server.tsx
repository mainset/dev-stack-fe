import BrowserReactApp from './app.browser';

type ProvideServerReactAppParams = {
  reqUrl: string;
  fullUrl: string;
  // Context?: Record<string, any>;
};

const provideServerReactApp = (params?: ProvideServerReactAppParams) => {
  console.log({ params });

  return BrowserReactApp;
};

export default provideServerReactApp;
