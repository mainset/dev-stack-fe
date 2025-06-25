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

  const hostPackageDependencyPackagePath = path.join(
    hostPackageNodeModulesPath,
    dependencyPackageName,
  );

  const isNodeModulesLinkedOrWorkspace = fs.existsSync(
    hostPackageDependencyPackagePath,
  );

  // If the package is linked or part of a workspace, return the full path
  // Otherwise, return just the package name (for packages installed from the registry)
  return isNodeModulesLinkedOrWorkspace
    ? hostPackageDependencyPackagePath
    : dependencyPackageName;
}

function resolveHostPackageBinForCLICommandPath(
  hostPackageName: string,
  // dependencyPackageName: string,
  cliCommandName: string,
) {
  /* Previous implementation
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
  */

  // installed from the registry
  const dependencyPackageNodeModulesPath = path.resolve(
    runtimePathById.root,
    `node_modules/.bin/${cliCommandName}`,
  );

  // linked / workspace:^ package
  const dependencyWorkspacePackageNodeModulesPath = path.resolve(
    runtimePathById.root,
    `node_modules/${hostPackageName}/node_modules/.bin/${cliCommandName}`,
  );

  return fs.existsSync(dependencyPackageNodeModulesPath)
    ? dependencyPackageNodeModulesPath
    : dependencyWorkspacePackageNodeModulesPath;
}

export {
  resolveHostPackageBinForCLICommandPath,
  resolveHostPackageNodeModulesPath,
};
