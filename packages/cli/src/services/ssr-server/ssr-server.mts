import cors from 'cors';
import type { Request, Response } from 'express';

import { ExpressBaseApp } from '../express-base-app/index.mjs';
import global from './global.mjs';
import { ssrServerConfig } from './ssr-server-config-loader.mjs';

const { renderSSRContentByPath, ...customExpressConfig } = ssrServerConfig;

global.init();

const { app, startListening } = new ExpressBaseApp(customExpressConfig);

app.use(cors());

// Get all path which is not starts from api
Object.keys(renderSSRContentByPath).forEach((renderSSRContentPath) => {
  app.get(renderSSRContentPath, async (req: Request, res: Response) => {
    try {
      // Construct the full URL for the incoming request
      const fullUrl = `${req.protocol}://${req.get('host')}${req.url}`;

      const renderSSRContent = renderSSRContentByPath[renderSSRContentPath];

      const htmlContent = await renderSSRContent({
        reqUrl: req.url,
        fullUrl,
      });

      res.send(htmlContent);
    } catch (error) {
      if (error instanceof Response && error.status === 302) {
        // Handle redirects
        res.redirect(error.headers.get('Location') || '/');
      }

      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
});

startListening();
