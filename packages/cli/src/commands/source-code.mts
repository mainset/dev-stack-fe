import { Command } from 'commander';
import path from 'path';

import { runtimePathById } from '../runtime/index.mjs';
import {
  consoleColorize,
  initProcessCatchErrorLogger,
} from '../utils/index.mjs';
import {
  execPurgeDist,
  execTypeScriptCompileSourceCode,
  execTypeScriptCompileTypeOnly,
  runTypeScriptCompileSourceCode,
  runTypeScriptCompileTypeOnly,
} from './process-runner-chunks/index.mjs';

function registerSourceCodeCommand(program: Command) {
  program
    .command('source-code')
    .description('Run source code compile or watch using TypeScript')
    .requiredOption('-e, --exec <type>', 'Execution mode: compile or watch')
    // .option('-b, --builder <builder>', 'Compiler tool (default: tsc)', 'tsc')
    .option('-c, --config <path>', 'Path to config file', './tsconfig.json')
    .action((options) => {
      // Step 0: determinate command params
      const typeScriptSourceCodeConfigPath = path.join(
        runtimePathById.root,
        options.config,
      );

      if (options.exec === 'compile') {
        // ========== Compile mode ==========
        console.log('\n🏗️  [mainset cli] source-code: compile');

        try {
          // Step 1: purge dist folder
          execPurgeDist();

          // Step 2: compile source code
          execTypeScriptCompileSourceCode({
            configPath: typeScriptSourceCodeConfigPath,
          });

          // Step 3: compile type only
          execTypeScriptCompileTypeOnly();

          console.log('\n✅ Build completed successfully\n');
        } catch (error) {
          initProcessCatchErrorLogger('source-code', error, 'compile');
        }
      } else if (options.exec === 'watch') {
        // ========== Watch mode ==========
        console.log('\n🏗️  [mainset cli] source-code: watch');

        try {
          // Step 1: purge dist folder
          execPurgeDist();

          // Step 2: watch source code
          runTypeScriptCompileSourceCode({
            configPath: typeScriptSourceCodeConfigPath,
          });

          // Step 3: watch type only
          runTypeScriptCompileTypeOnly();
        } catch (error) {
          initProcessCatchErrorLogger('source-code', error, 'watch');
        }
      } else {
        console.error(
          consoleColorize(
            'BRIGHT_YELLOW',
            `[mainset cli][source-code] Unknown exec mode: "${options.exec}"`,
          ),
        );
        process.exit(1);
      }
    });
}

export { registerSourceCodeCommand };
