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

function execRslibCLICommand(command: string) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return execImmediateCommand(`${rslibCLICommandPath} ${command}`);
}

function runRslibCLICommand(commandParams: string[]) {
  const rslibCLICommandPath = getRslibCLICommandPath();

  return runStreamingCommand(rslibCLICommandPath, [...commandParams]);
}

export { execRslibCLICommand, runRslibCLICommand };
