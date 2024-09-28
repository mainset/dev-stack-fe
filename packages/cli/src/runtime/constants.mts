const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

type NodeEnv = (typeof NODE_ENV)[keyof typeof NODE_ENV];

export { NODE_ENV };
export type { NodeEnv };
