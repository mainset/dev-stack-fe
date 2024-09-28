import { Command } from 'commander';
import fs from 'fs';

import type { ExpressBaseAppConfig } from '../express-base-app/index.mjs';

// Step-1: parse CLI arguments
const options = new Command()
  .option(
    '--serveStaticConfig <path>',
    'Path to ./config/serve-static.config.json config file',
  )
  .allowUnknownOption() // Bypass {error: unknown option '--config'}
  .allowExcessArguments() // Bypass {error: too many arguments. Expected 0 arguments but got 2.}
  .parse(process.argv)
  .opts();

// Step-2: load Serve Static config from JSON file
const serveStaticConfig: ExpressBaseAppConfig = options.serveStaticConfig
  ? JSON.parse(fs.readFileSync(options.serveStaticConfig, 'utf-8'))
  : {};

export { serveStaticConfig };
