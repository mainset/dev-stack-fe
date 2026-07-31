import type { ExecSyncOptions, SpawnOptions } from 'child_process';
import { execSync, spawn } from 'child_process';
import fs from 'fs';

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
function execImmediateCommand(
  fullCommandString: string,
  options: ExecSyncOptions = {},
) {
  try {
    const { env, ...restExecSyncOptions } = options;

    execSync(fullCommandString, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env,
      },
      ...restExecSyncOptions,
    });
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
function runStreamingCommand(
  command: string,
  args: string[],
  options: SpawnOptions = {},
) {
  try {
    const { env, ...restSpawnOptions } = options;

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        ...env,
      },
      ...restSpawnOptions,
    });

    // Track the process using ProcessManager as it could live in the background after crashing
    // Examples: server stacks when files removed while server is running
    // 1. rm -rf ./dist
    // 2. rm -rf ./node_modules
    processManager.trackProcess(child);

    child.on('exit', (code) => process.exit(code ?? 1));

    // NOTE: return isn't required, but it uses in combination with {runStreamingInSync} func
    return child;
  } catch (error) {
    initProcessCatchErrorLogger('runStreamingCommand', error);
  }
}

const WAIT_FOR_FILE__DEFAULT_POLL_INTERVAL_MS = 200;
const WAIT_FOR_FILE__DEFAULT_TIMEOUT_MS = 120_000;

type WaitForFileOption =
  string | { path: string; pollIntervalMs?: number; timeoutMs?: number };

/**
 * Runs a streaming command in sync mode: each subsequent command only starts
 * once the previous one is considered "ready".
 *
 * NOTE: {runStreamingCommand} spawns with {stdio: 'inherit'} so its output streams
 * directly to the terminal — this means {child.stdout} is always `null` and can NOT
 * be listened to for readiness text. Use {waitForFile} (polls the filesystem for a
 * path to exist) as the readiness signal instead.
 *
 * Example: runStreamingInSync([{ runCommand: () => runStreamingCommand(), waitForFile: './dist/private/ssr-server.config.mjs' }]);
 */
async function runStreamingInSync(
  streamings: {
    runCommand: () => ReturnType<typeof runStreamingCommand>;
    waitForFile?: WaitForFileOption;
  }[],
) {
  for (const streaming of streamings) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise<void>((resolve, reject) => {
      const child = streaming.runCommand();

      if (!child) {
        reject(
          new Error(
            '[mainset cli][runStreamingInSync] Previous command failed, aborting sequence.',
          ),
        );
        return;
      }

      if (streaming.waitForFile) {
        const {
          path: waitForFilePath,
          pollIntervalMs = WAIT_FOR_FILE__DEFAULT_POLL_INTERVAL_MS,
          timeoutMs = WAIT_FOR_FILE__DEFAULT_TIMEOUT_MS,
        } = typeof streaming.waitForFile === 'string'
          ? { path: streaming.waitForFile }
          : streaming.waitForFile;

        const startedAt = Date.now();

        const pollIntervalId = setInterval(() => {
          if (fs.existsSync(waitForFilePath)) {
            clearInterval(pollIntervalId);
            resolve();
            return;
          }

          if (Date.now() - startedAt > timeoutMs) {
            clearInterval(pollIntervalId);
            reject(
              new Error(
                `[mainset cli][runStreamingInSync] Timed out after ${timeoutMs}ms waiting for "${waitForFilePath}" to be generated.`,
              ),
            );
          }
        }, pollIntervalMs);

        child.on('exit', () => clearInterval(pollIntervalId));
      } else {
        resolve();
      }

      child.on('error', reject);
    }).catch((err) => {
      // Stop further execution if a command fails
      throw err;
    });
  }
}

export {
  execImmediateCommand,
  initProcessCatchErrorLogger,
  runStreamingCommand,
  runStreamingInSync,
};
