import express, { Express } from 'express';
import type { Options } from 'http-proxy-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

import { runtimePathById } from '../../runtime/index.mjs';
import { consoleColorize } from '../../utils/console-colorize.mjs';
import defaultExpressConfig from './express-base-app.config.json' with { type: 'json' };

interface ServeStaticConfig {
  rootPath?: string; // Path to the directory containing static files
  publicPath?: string; // URL path to serve static files from
}

interface ExpressBaseAppConfig {
  listenPort?: number;
  serveStatics?: ServeStaticConfig[];
  proxyConfigByPath?: Record<string, Options>;
}

class ExpressBaseApp {
  // ========== Private ==========
  private readonly listenPort: ExpressBaseAppConfig['listenPort'];
  // ========== Public ==========
  readonly app: Express;

  // ========== Constructor ==========
  constructor(customExpressConfig: Partial<ExpressBaseAppConfig> = {}) {
    const {
      listenPort = defaultExpressConfig.listenPort,
      serveStatics = defaultExpressConfig.serveStatics,
      proxyConfigByPath,
    } = customExpressConfig;

    this.listenPort = listenPort;

    this.app = express();

    this.appUseStatic({
      serveStatics,
    });

    this.appUseProxyMiddleware({
      proxyConfigByPath,
    });

    this.startListening = this.startListening.bind(this);
  }

  // ========== Private ==========
  private appUseStatic({
    serveStatics,
  }: Pick<ExpressBaseAppConfig, 'serveStatics'>) {
    serveStatics?.forEach((customServeStaticConfig) => {
      const serveStaticConfig = {
        ...defaultExpressConfig.serveStatics[0],
        ...customServeStaticConfig,
      };

      this.app.use(
        serveStaticConfig.publicPath,
        express.static(serveStaticConfig.rootPath),
      );
    });
  }

  private appUseProxyMiddleware({
    proxyConfigByPath = {},
  }: Pick<ExpressBaseAppConfig, 'proxyConfigByPath'>) {
    Object.keys(proxyConfigByPath)?.forEach((proxyPath) => {
      this.app.use(
        proxyPath,
        createProxyMiddleware(proxyConfigByPath[proxyPath]),
      );
    });
  }

  // ========== Public ==========
  public startListening() {
    this.app.listen(this.listenPort, async (error?: NodeJS.ErrnoException) => {
      // NOTE: Express 5 hands {listen} errors to this same callback instead of
      // throwing them. Unchecked, a server that never bound its port (e.g. a
      // second dev server for the same app) still printed "listening at" below
      // and lingered on — while requests kept hitting whichever process
      // really held the port.
      if (error) {
        console.error(
          consoleColorize(
            'BRIGHT_RED',
            `[mainset cli] Failed to listen on port ${this.listenPort}:`,
          ),
          error.code === 'EADDRINUSE'
            ? `the port is already in use — is another dev server for this app still running? (${error.message})`
            : error.message,
        );

        process.exit(1);
      }

      const packageJson = await import(
        path.resolve(runtimePathById.root, 'package.json'),
        { with: { type: 'json' } }
      );

      console.log(
        `${
          packageJson?.default?.name || 'Web App'
        } listening at http://localhost:${this.listenPort}`,
      );
    });
  }
}

export { ExpressBaseApp };
export type { ExpressBaseAppConfig };
