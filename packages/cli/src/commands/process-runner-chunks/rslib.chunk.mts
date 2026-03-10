import type { ExecSyncOptions, SpawnOptions } from 'child_process';

import { resolveHostPackageBinForCLICommandPath } from '../../runtime/index.mjs';
import {
  execImmediateCommand,
  runStreamingCommand,
} from '../../utils/index.mjs';

function getRslibCLICommandPath() {
  const rslibCLICommandPath = resolveHostPackageBinForCLICommandPath(
    '@mainset/builder-rslib',
    'rslib',
  );

  return rslibCLICommandPath;
}

function execImmediateRslibCLICommand(
  command: string,
  options: ExecSyncOptions = {},
) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return execImmediateCommand(`${rslibCLICommandPath} ${command}`, options);
}

function runStreamingRslibCLICommand(
  commandParams: string[],
  options: SpawnOptions = {},
) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return runStreamingCommand(rslibCLICommandPath, [...commandParams], options);
}

export { execImmediateRslibCLICommand, runStreamingRslibCLICommand };
