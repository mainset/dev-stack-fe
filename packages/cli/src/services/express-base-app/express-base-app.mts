import express, { Express } from 'express';
import type { Options } from 'http-proxy-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

import { runtimePathById } from '../../runtime/index.mjs';
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
    this.app.listen(this.listenPort, async () => {
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
