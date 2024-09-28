import { resolveHostPackageBinForCLICommandPath } from '../../runtime/index.mjs';
import {
  execImmediateCommand,
  runStreamingCommand,
} from '../../utils/index.mjs';

async function getRslibCLICommandPath() {
  const rslibCLICommandPath = await resolveHostPackageBinForCLICommandPath(
    '@mainset/builder-rslib',
    '@rslib/core',
    'rslib',
  );

  return rslibCLICommandPath;
}

async function execRslibCLICommand(command: string) {
  const rslibCLICommandPath = await getRslibCLICommandPath();

  return execImmediateCommand(`node ${rslibCLICommandPath} ${command}`);
}

async function runRslibCLICommand(commandParams: string[]) {
  const rslibCLICommandPath = await getRslibCLICommandPath();

  return runStreamingCommand('node', [rslibCLICommandPath, ...commandParams]);
}

export { execRslibCLICommand, runRslibCLICommand };
