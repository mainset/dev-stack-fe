import ReactDOMClient from 'react-dom/client';

import BrowserReactApp from './app.browser';

const targetContainer = document.getElementById('example-react');

if (targetContainer) {
  ReactDOMClient.createRoot(targetContainer).render(BrowserReactApp);
}
