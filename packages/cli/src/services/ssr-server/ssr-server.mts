import cors from 'cors';
// NOTE: aliased so that a bare {Response} in this file unambiguously means the
// global fetch Response — which is what a thrown redirect / error actually is.
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { ExpressBaseApp } from '../express-base-app/index.mjs';
import global from './global.mjs';
import type { SSRRenderResult } from './ssr-server-config-loader.mjs';
import {
  getSSRServerConfig,
  ssrServerConfig,
} from './ssr-server-config-loader.mjs';

// NOTE: {content-length} is left to express, which recomputes it for the body
// actually sent; {set-cookie} is re-applied separately (see sendThrownResponse).
const SKIPPED_THROWN_RESPONSE_HEADERS = ['content-length', 'set-cookie'];

const {
  renderSSRContentByPath: startupRenderSSRContentByPath,
  ...customExpressConfig
} = ssrServerConfig;

global.init();

const { app, startListening } = new ExpressBaseApp(customExpressConfig);

app.use(cors());

function sendSSRRenderResult(
  res: ExpressResponse,
  { html, status = 200, headers, cookies }: SSRRenderResult,
) {
  if (headers) {
    res.set(headers);
  }

  cookies?.forEach(({ name, value, options = {} }) => {
    res.cookie(name, value, options);
  });

  res.status(status).send(html);
}

async function sendThrownResponse(
  res: ExpressResponse,
  thrownResponse: Response,
) {
  // NOTE: forward whatever the app author put on the thrown Response before
  // answering — a redirect that also sets a session cookie has to keep it.
  // {set-cookie} goes through {getSetCookie()} because {Headers.forEach()}
  // collapses repeated set-cookie headers into a single comma-joined value that
  // browsers reject.
  thrownResponse.headers.forEach((headerValue, headerName) => {
    if (!SKIPPED_THROWN_RESPONSE_HEADERS.includes(headerName.toLowerCase())) {
      res.set(headerName, headerValue);
    }
  });

  thrownResponse.headers.getSetCookie().forEach((setCookieHeader) => {
    res.append('Set-Cookie', setCookieHeader);
  });

  const location = thrownResponse.headers.get('Location');

  // NOTE: keyed off an actual {Location} header rather than off the {3xx} range
  // alone — {304} / {305} / {306} sit in that range but carry no redirect
  // target. Covers permanent ({301} / {308}) and temporary ({302} / {303} /
  // {307}) redirects alike, not just {302}.
  if (location && thrownResponse.status >= 300 && thrownResponse.status < 400) {
    res.redirect(thrownResponse.status, location);

    return;
  }

  // NOTE: any other thrown Response — e.g. a route loader's
  // {throw new Response('Not Found', { status: 404 })} — gets its real status
  // surfaced instead of falling through to the generic {500} below. The body is
  // read because {statusText} defaults to an empty string in node, so otherwise
  // that {404} would reach the client as the literal string {Error}.
  const body = await thrownResponse.text();

  res
    .status(thrownResponse.status)
    .send(body || thrownResponse.statusText || 'Error');
}

// Get all path which is not starts from api
Object.keys(startupRenderSSRContentByPath).forEach((renderSSRContentPath) => {
  app.get(
    renderSSRContentPath,
    async (req: ExpressRequest, res: ExpressResponse) => {
      try {
        // Construct the full URL for the incoming request
        const fullUrl = `${req.protocol}://${req.get('host')}${req.url}`;

        // NOTE: the render function is read through {getSSRServerConfig()} rather
        // than from the map destructured at startup, because in {development} the
        // compiled config is re-imported after every rebuild (see
        // ssr-server-config-loader.mts). Routes stay registered from the startup
        // map though, so fall back to it when a reload dropped or renamed this
        // path — otherwise the handler would blow up with "renderSSRContent is
        // not a function" and report a misleading {500}.
        const { renderSSRContentByPath } = await getSSRServerConfig();
        const renderSSRContent =
          renderSSRContentByPath[renderSSRContentPath] ??
          startupRenderSSRContentByPath[renderSSRContentPath];

        const renderResult = await renderSSRContent({
          reqUrl: req.url,
          fullUrl,
          // NOTE: the raw request headers, so a render can resolve things that
          // are only knowable from the request itself — {Accept-Language} for
          // picking a locale, {Cookie} for a persisted preference. Without
          // this, an SSR render has no way to tell one visitor from another
          // and has to fall back to a fixed default, which then has to be
          // corrected client-side (a visible flash, and the wrong locale is
          // what crawlers see).
          reqHeaders: req.headers,
        });

        sendSSRRenderResult(res, renderResult);
      } catch (error) {
        // NOTE: both react-router's {redirect()} and a route loader's
        // {throw new Response(...)} surface here as a global fetch Response.
        if (error instanceof Response) {
          await sendThrownResponse(res, error);

          return;
        }

        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    },
  );
});

startListening();
