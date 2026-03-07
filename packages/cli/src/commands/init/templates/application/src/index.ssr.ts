import ReactDOMClient from 'react-dom/client';

import BrowserReactApp from './app.browser';

const targetContainer = document.getElementById('example-react');

if (targetContainer) {
  ReactDOMClient.hydrateRoot(targetContainer, BrowserReactApp);
}
