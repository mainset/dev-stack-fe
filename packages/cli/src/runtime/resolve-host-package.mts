import fs from 'fs';
import path from 'path';

import { runtimePathById } from './path.mjs';

function resolveHostPackageNodeModulesPath(
  hostPackageName: string,
  dependencyPackageName: string,
) {
  const hostPackageNodeModulesPath = path.resolve(
    runtimePathById.root,
    `node_modules/${hostPackageName}/node_modules`,
  );

  const isNodeModulesDeepNested = fs.existsSync(hostPackageNodeModulesPath);

  return isNodeModulesDeepNested // Pnpm uses such a structure
    ? path.join(hostPackageNodeModulesPath, dependencyPackageName)
    : path.join(runtimePathById.root, 'node_modules', dependencyPackageName);
}

async function resolveHostPackageBinForCLICommandPath(
  hostPackageName: string,
  dependencyPackageName: string,
  cliCommandName?: string,
) {
  // Pnpm node_modules structure
  const dependencyPackageNodeModulesPath = resolveHostPackageNodeModulesPath(
    hostPackageName,
    dependencyPackageName,
  );

  const packageJson = await import(
    path.join(dependencyPackageNodeModulesPath, 'package.json'),
    { with: { type: 'json' } }
  );

  const binPath = cliCommandName
    ? packageJson.default.bin[cliCommandName]
    : packageJson.default.bin;

  return path.join(dependencyPackageNodeModulesPath, binPath);
}

export {
  resolveHostPackageBinForCLICommandPath,
  resolveHostPackageNodeModulesPath,
};
