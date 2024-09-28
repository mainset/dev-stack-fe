import { execSync, spawn } from 'child_process';

import { consoleColorize } from '../index.mjs';
import { processManager } from './process-manager.mjs';

function initProcessCatchErrorLogger(
  commandName: string,
  error: Error | unknown,
  commandParam?: string,
) {
  const commandParamLog = commandParam ? ` ${commandParam} ` : ' ';
  if (error instanceof Error) {
    // Log
    console.error(
      consoleColorize(
        'BRIGHT_RED',
        `[mainset cli][${commandName}]${commandParamLog}Failed:`,
      ),
      error.message,
    );

    // Exit
    process.exit(1);
  } else {
    // Log
    console.error(
      consoleColorize(
        'BRIGHT_RED',
        `[mainset cli][${commandName}]${commandParamLog}Failed with an unknown error:`,
      ),
      error,
    );

    // Exit
    process.exit(1);
  }
}

/**
 * Executes a short-lived command synchronously.
 * The entire command string, including its arguments, must be passed.
 *
 * Example: execImmediateCommand('rspack --config ./config/rspack.config.ts');
 */
function execImmediateCommand(fullCommandString: string) {
  try {
    execSync(fullCommandString, { stdio: 'inherit' });
  } catch (error) {
    initProcessCatchErrorLogger('execImmediateCommand', error);
  }
}

/**
 * Runs a long-lived streaming command asynchronously.
 * The command and its arguments must be passed separately.
 *
 * Example: runStreamingCommand('rspack', ['serve', '--config', './config/rspack.config.ts']);
 */
function runStreamingCommand(command: string, args: string[]) {
  try {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    // Track the process using ProcessManager as it could live in the background after crashing
    // Examples: server stacks when files removed while server is running
    // 1. rm -rf ./dist
    // 2. rm -rf ./node_modules
    processManager.trackProcess(child);

    child.on('exit', (code) => process.exit(code ?? 1));
  } catch (error) {
    initProcessCatchErrorLogger('runStreamingCommand', error);
  }
}

export {
  execImmediateCommand,
  initProcessCatchErrorLogger,
  runStreamingCommand,
};
