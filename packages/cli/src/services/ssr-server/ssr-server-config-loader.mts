import { parseCliOptions } from '../../runtime/index.mjs';
import type { ExpressBaseAppConfig } from '../express-base-app/index.mjs';

// Step-1: parse CLI arguments

const options = parseCliOptions([
  {
    commanderFlags: '--ssrServerConfig <path>',
    description: 'Path to ./config/ssr-server.config.mts config file',
  },
]);

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
