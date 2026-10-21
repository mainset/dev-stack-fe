import fs from 'fs';
import { pathToFileURL } from 'url';

import { parseCliOptions } from '../../runtime/index.mjs';
import type { ExpressBaseAppConfig } from '../express-base-app/index.mjs';

// Step-1: parse CLI arguments
const options = parseCliOptions([
  {
    commanderFlags: '--serveStaticConfig <path>',
    description: 'Path to ./config/serve-static.config.{mjs,json} config file',
  },
]);

// Step-2: load Serve Static config from JSON file
const isConfigFileJsonWithoutProcessEnvUsage = /\.json$/.test(
  options.serveStaticConfig,
);

const serveStaticConfig: ExpressBaseAppConfig =
  isConfigFileJsonWithoutProcessEnvUsage
    ? JSON.parse(
        fs.readFileSync(options.serveStaticConfig, 'utf-8') ||
          // NOTE: dot not crash in case if {.json} file is empty
          '{}',
      )
    : // NOTE: a file URL, not a path — see express-base-app.mts
      (await import(pathToFileURL(options.serveStaticConfig).href)).default;

export { serveStaticConfig };
