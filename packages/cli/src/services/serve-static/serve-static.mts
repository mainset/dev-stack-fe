import { ExpressBaseApp } from '../express-base-app/index.mjs';
import { serveStaticConfig } from './serve-static-config-loader.mjs';

const { startListening } = new ExpressBaseApp(serveStaticConfig);

startListening();
