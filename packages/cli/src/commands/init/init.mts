import { Command } from 'commander';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

import { runtimePathById } from '../../runtime/index.mjs';
import {
  consoleColorize,
  initProcessCatchErrorLogger,
} from '../../utils/index.mjs';

async function handleConfigurationDependencies(targetDir: string) {
  const rl = readline.createInterface({ input, output });

  let shouldInstall = true;
  try {
    const answer = await rl.question(
      'Do you want to install development dependencies (@mainset/dev-stack-fe etc.)? (Y/n) ',
    );
    shouldInstall = answer.trim().toLowerCase() !== 'n';
  } catch {
    // default true
  }

  if (shouldInstall) {
    let packageManager = 'npm';
    try {
      const answer = await rl.question(
        'Which package manager do you use? (npm/pnpm/yarn/bun/other) [npm]: ',
      );
      packageManager = answer.trim().toLowerCase() || 'npm';
    } catch {
      // default npm
    }

    rl.close();

    let installCommand = '';
    const packages = [
      '@mainset/dev-stack-fe',
      '@mainset/cli',
      'cross-env',
      'eslint',
      'husky',
      'prettier',
      'stylelint',
    ].join(' ');

    if (['npm', 'pnpm', 'yarn', 'bun'].includes(packageManager)) {
      const cmd = packageManager === 'npm' ? 'install' : 'add';
      installCommand = `${packageManager} ${cmd} -D ${packages}`;
    } else {
      // assume 'other' is the binary name user typed if not in basic list
      installCommand = `${packageManager} i -D ${packages}`;
    }

    console.log(
      consoleColorize(
        'BLUE',
        `\n\nInstalling dependencies with:\n${installCommand}\n`,
      ),
    );

    try {
      execSync(installCommand, {
        cwd: targetDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' },
      });
      console.log(
        consoleColorize('BRIGHT_GREEN', 'Dependencies installed successfully.'),
      );
    } catch (error) {
      console.error(
        consoleColorize(
          'BRIGHT_RED',
          `\n❌ Failed to install dependencies automatically.`,
        ),
      );
      console.log(
        consoleColorize(
          'BRIGHT_YELLOW',
          `Please run the following command manually:\n\n  ${installCommand}\n`,
        ),
      );
    }
    // Close readline if not installing
  } else {
    rl.close();
  }
}

function registerInitCommand(program: Command) {
  program
    .command('init [appName]')
    .description('Run init project or configuration process')
    .option(
      '-m, --mode <type>',
      'Initialization mode: app, package or config',
      'application',
    )
    .option('-p, --path <relativePath>', 'Initialization path', './')
    .action(async (appName, options) => {
      // Use runtimePathById.root to resolve the target directory relative to the project root
      const targetDir = path.resolve(
        runtimePathById.root,
        options.path,
        appName || '',
      );

      if (options.mode === 'application') {
        if (!appName) {
          console.error(
            consoleColorize(
              'BRIGHT_RED',
              `\n[mainset cli][init] App name is required for application initialization.`,
            ),
          );
          process.exit(1);
        }

        // ========== Application mode ==========
        console.log('\n🏗️  [mainset cli] init: application');

        try {
          // Use runtimePathById.msCLISrc to resolve the template directory relative to the CLI runtime
          const templateDir = path.resolve(
            runtimePathById.msCLISrc,
            '../../../src/commands/init/templates/application',
          );

          if (fs.existsSync(targetDir)) {
            console.error(
              consoleColorize(
                'BRIGHT_YELLOW',
                `\n[mainset cli][init] Directory "${appName}" already exists at "${targetDir}". Aborting.`,
              ),
            );
            process.exit(1);
          }

          fs.cpSync(templateDir, targetDir, { recursive: true });

          console.log(
            `\n✅ Application "${appName}" initialized successfully.\n`,
          );
        } catch (error) {
          initProcessCatchErrorLogger('init', error, 'application');
        }
      } else if (options.mode === 'config') {
        // ========== Configuration mode ==========
        console.log('\n🏗️  [mainset cli] init: configuration');

        try {
          const templateDir = path.resolve(
            runtimePathById.msCLISrc,
            '../../../src/commands/init/templates/configuration',
          );

          if (!fs.existsSync(templateDir)) {
            console.log(
              consoleColorize(
                'BRIGHT_YELLOW',
                `\n[mainset cli][init] Configuration template not found at ${templateDir}`,
              ),
            );
            return;
          }

          fs.cpSync(templateDir, targetDir, { recursive: true });

          console.log('\n✅ Configuration initialized successfully.\n');

          await handleConfigurationDependencies(targetDir);
        } catch (error) {
          initProcessCatchErrorLogger('init', error, 'configuration');
        }
      } else {
        console.error(
          consoleColorize(
            'BRIGHT_YELLOW',
            `[mainset cli][init] Unknown init mode: "${options.mode}"`,
          ),
        );
        process.exit(1);
      }
    });
}

export { registerInitCommand };
