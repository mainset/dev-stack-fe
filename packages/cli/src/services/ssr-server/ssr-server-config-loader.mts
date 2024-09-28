import { Command } from 'commander';

import type { ExpressBaseAppConfig } from '../express-base-app/index.mjs';

// Step-1: parse CLI arguments
const options = new Command()
  .option(
    '--ssrServerConfig <path>',
    'Path to ./config/ssr-server.config.mts config file',
  )
  .allowUnknownOption() // Bypass {error: unknown option '--config'}
  .allowExcessArguments() // Bypass {error: too many arguments. Expected 0 arguments but got 2.}
  .parse(process.argv)
  .opts();

interface SSRConfigParams extends Partial<ExpressBaseAppConfig> {
  renderSSRContentByPath: Record<
    string, // URL path to render SSR content
    (_params: { reqUrl: string; fullUrl: string }) => Promise<string>
  >;
}

// Step-2: load SSR server config from JSON file
const ssrServerConfig: SSRConfigParams = (await import(options.ssrServerConfig))
  .default;

export { ssrServerConfig };

export type { SSRConfigParams };
