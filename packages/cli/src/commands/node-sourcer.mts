import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

import { runtimePathById } from '../runtime/index.mjs';
import {
  consoleColorize,
  initProcessCatchErrorLogger,
} from '../utils/index.mjs';
import {
  execImmediatePurgeDist,
  execImmediateRslibCLICommand,
  execImmediateTypeScriptCompileTypeOnly,
  runStreamingRslibCLICommand,
  runStreamingTypeScriptCompileTypeOnly,
} from './process-runner-chunks/index.mjs';

function registerNodeSourcerCommand(program: Command) {
  program
    .command('node-sourcer')
    .description('Run node-sourcer build or watch using Rslib')
    .requiredOption('-e, --exec <type>', 'Execution mode: build or watch')
    // .option('-b, --builder <builder>', 'Builder tool (default: rslib)', 'rslib')
    .option('-c, --config <path>', 'Path to config file', './rslib.config.mts')
    .action((options) => {
      // Step 0: determinate command params
      const customRslibConfigPath = path.resolve(
        runtimePathById.root,
        options.config,
      );
      const rslibConfigPath = fs.existsSync(customRslibConfigPath)
        ? customRslibConfigPath
        : path.resolve(
            runtimePathById.root,
            // NOTE: possibility to check if package is installed, otherwise throw error
            'node_modules',
            '@mainset/builder-rslib/dist/esm/rslib.node-sourcer.config.mjs',
          );

      if (options.exec === 'build') {
        // ========== Build mode ==========
        console.log('\n🏗️  [mainset cli] node-sourcer: build');

        try {
          // Step 1: purge dist folder
          execImmediatePurgeDist();

          // Step 2: build source code
          console.log('\n📦 Compiling Source Code with Rslib ...');
          execImmediateRslibCLICommand(`build --config ${rslibConfigPath}`);

          // Step 3: build type only
          execImmediateTypeScriptCompileTypeOnly();

          console.log('\n✅ Build completed successfully\n');
        } catch (error) {
          initProcessCatchErrorLogger('node-sourcer', error, 'build');
        }
      } else if (options.exec === 'watch') {
        // ========== Watch mode ==========
        console.log('\n🏗️  [mainset cli] node-sourcer: watch');

        try {
          // Step 1: purge dist folder
          execImmediatePurgeDist();

          // Step 2: watch source code
          runStreamingRslibCLICommand([
            'build',
            '--config',
            rslibConfigPath,
            '--watch',
          ]);

          // Step 3: watch type only
          runStreamingTypeScriptCompileTypeOnly();
        } catch (error) {
          initProcessCatchErrorLogger('node-sourcer', error, 'watch');
        }
      } else {
        console.error(
          consoleColorize(
            'BRIGHT_YELLOW',
            `[mainset cli][node-sourcer] Unknown exec mode: "${options.exec}"`,
          ),
        );
        process.exit(1);
      }
    });
}

export { registerNodeSourcerCommand };
