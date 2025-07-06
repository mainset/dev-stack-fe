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

function execImmediateRslibCLICommand(command: string) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return execImmediateCommand(`${rslibCLICommandPath} ${command}`);
}

function runStreamingRslibCLICommand(commandParams: string[]) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return runStreamingCommand(rslibCLICommandPath, [...commandParams]);
}

export { execImmediateRslibCLICommand, runStreamingRslibCLICommand };
