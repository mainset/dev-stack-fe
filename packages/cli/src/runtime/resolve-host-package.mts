import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { runtimePathById } from './path.mjs';

function resolveHostPackageNodeModulesPath(
  hostPackageName: string,
  dependencyPackageName: string,
) {
  const hostPackageDependencyPackagePath = path.resolve(
    runtimePathById.root,
    `node_modules/${hostPackageName}/node_modules/${dependencyPackageName}`,
  );

  // If the package is linked or part of a workspace, return the full path
  // Otherwise, return just the package name (for packages installed from the registry)
  return fs.existsSync(hostPackageDependencyPackagePath)
    ? hostPackageDependencyPackagePath
    : fileURLToPath(import.meta.resolve(dependencyPackageName));
}

function resolveHostPackageBinForCLICommandPath(
  hostPackageName: string,
  // dependencyPackageName: string,
  cliCommandName: string,
) {
  /*
  * ========== V1 implementation using pnpm node_modules structure ==========
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
  */

  const hostPackageDependencyBinCLICommandPath = path.resolve(
    runtimePathById.root,
    `node_modules/${hostPackageName}/node_modules/.bin/${cliCommandName}`,
  );

  // Return the full path if the dependency is linked or part of a workspace (nested under the host package)
  if (fs.existsSync(hostPackageDependencyBinCLICommandPath)) {
    // return fileURLToPath(
    //   import.meta.resolve(hostPackageDependencyBinCLICommandPath),
    // );
    return fs.realpathSync(hostPackageDependencyBinCLICommandPath);
  }

  // Otherwise, return the path to the dependency in the root node_modules (for registry-installed packages)
  const dependencyBinCLICommandPath = path.resolve(
    runtimePathById.root,
    `node_modules/.bin/${cliCommandName}`,
  );

  // return fileURLToPath(import.meta.resolve(dependencyBinCLICommandPath));
  return fs.realpathSync(dependencyBinCLICommandPath);
}

export {
  resolveHostPackageBinForCLICommandPath,
  resolveHostPackageNodeModulesPath,
};
