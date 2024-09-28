import { NODE_ENV } from '../runtime/index.mjs';
import { consoleColorize } from './console-colorize.mjs';

function verifyOrSetNodeEnv() {
  if (!process.env.NODE_ENV) {
    console.warn(
      consoleColorize(
        'BRIGHT_YELLOW',
        `[mainset cli] NODE_ENV is not set. Falling back to "${NODE_ENV.PRODUCTION}".`,
      ),
    );
    process.env.NODE_ENV = NODE_ENV.PRODUCTION;
  } else if (!Object.values(NODE_ENV).includes(process.env.NODE_ENV)) {
    console.warn(
      consoleColorize(
        'BRIGHT_YELLOW',
        `[mainset cli] Unsupported NODE_ENV "${process.env.NODE_ENV}". Falling back to "${NODE_ENV.PRODUCTION}".`,
      ),
    );
    process.env.NODE_ENV = NODE_ENV.PRODUCTION;
  }
}

export { verifyOrSetNodeEnv };
