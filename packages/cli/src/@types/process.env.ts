import type { NodeEnv } from '../runtime/index.mjs';

interface ProcessEnvBase {
  NODE_ENV?: NodeEnv;
}

/* eslint-disable */
// Disabling namespace rule because NodeJS type augmentation requires it

// Global declaration for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnvBase {}
  }
}

/* eslint-enable */

export type { ProcessEnvBase };
