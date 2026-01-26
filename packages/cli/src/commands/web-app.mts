import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

import { initDotenv } from '../dotenv-config.mjs';
import {
  resolveHostPackageBinForCLICommandPath,
  runtimePathById,
} from '../runtime/index.mjs';
import {
  consoleColorize,
  execImmediateCommand,
  initProcessCatchErrorLogger,
  runStreamingCommand,
  runStreamingInSync,
} from '../utils/index.mjs';
import { execImmediatePurgeDist } from './process-runner-chunks/index.mjs';

function registerWebAppCommand(program: Command) {
  program
    .command('web-app')
    .description('Run web app build or serve using bundler')
    .requiredOption(
      '-e, --exec <type>',
      'Execution mode: build, serve, serve-static',
    )
    // .option(
    //   '-b, --bundler <bundler>',
    //   'Bundler tool: webpack or rslib (default: webpack)',
    //   'webpack'
    // )
    .option('-c, --config <path>', 'Path to config file')
    .option(
      '--serveMode <mode>',
      'Serve mode: ssr or csr (default: ssr)',
      'ssr',
    )
    .action((options) => {
      // !IMPORTANT: Load environment variables from .env file ONLY when we are compiling Web Applications
      // as it logs {missing .env file} console error during {source-code} / {node-sourcer} compilation
      initDotenv();

      // Step 0: determinate command params
      const customWebpackConfigPath = path.resolve(
        runtimePathById.root,
        options.config || './config/webpack.config.mjs',
      );

      // SSR server path
      const ssrServerEntryPath = path.resolve(
        runtimePathById.msCLISrc,
        '../services/ssr-server/ssr-server.mjs',
      );

      const ssrServerConfigCompiledPath = path.resolve(
        runtimePathById.dist,
        './private/ssr-server.config.mjs',
      );

      // Webpack paths
      const webpackCLICommandPath = resolveHostPackageBinForCLICommandPath(
        '@mainset/bundler-webpack',
        'webpack',
      );
      const webpackSSRConfigPath = fs.existsSync(customWebpackConfigPath)
        ? customWebpackConfigPath
        : path.resolve(
            runtimePathById.root,
            'node_modules',
            '@mainset/bundler-webpack/dist/esm/webpack-config/webapp.ssr.config.mjs',
          );

      /*
      // Rslib paths
      const rslibSSRConfigPath = path.resolve(
        runtimePathById.root,
        'node_modules',
        '@mainset/builder-rslib/dist/esm/rslib.ssr-server.config.mjs',
      );
      */

      if (options.exec === 'build') {
        // ========== Build mode ==========
        console.log('\n🏗️  [mainset cli] web-app: build');

        try {
          if (options.serveMode === 'ssr') {
            // ========== [Build] SSR mode ==========

            // Step 1: purge dist folder
            execImmediatePurgeDist();

            // Step 2: build:ssr-webapp source code
            console.log('\n📦 Compiling SSR WebApp with Webpack ...');
            execImmediateCommand(
              `${webpackCLICommandPath} --config ${webpackSSRConfigPath}`,
              {
                env: {
                  MS_CLI__WEBPACK_SERVE_MODE: 'ssr',
                },
              },
            );

            /*
            // Step 3: build:ssr-server source code
            console.log('\n📦 Compiling SSR Server with Rslib ...');
            execImmediateRslibCLICommand(`build --config ${rslibSSRConfigPath}`);
            */

            console.log('\n✅ SSR Build completed successfully\n');
          } else {
            // ========== [Build] CSR mode ==========

            const webpackCSRConfigPath = fs.existsSync(customWebpackConfigPath)
              ? customWebpackConfigPath
              : path.resolve(
                  runtimePathById.root,
                  'node_modules',
                  '@mainset/bundler-webpack/dist/esm/webpack-config/webapp.csr.config.mjs',
                );
            // Step 1: purge dist folder
            execImmediatePurgeDist();

            // Step 2: build:csr-webapp source code
            console.log('\n📦 Compiling CSR WebApp with Webpack ...');
            execImmediateCommand(
              `${webpackCLICommandPath} --config ${webpackCSRConfigPath}`,
              {
                env: {
                  MS_CLI__WEBPACK_SERVE_MODE: 'csr',
                },
              },
            );

            console.log('\n✅ CSR Build completed successfully\n');
          }
        } catch (error) {
          initProcessCatchErrorLogger('web-app', error, 'build');
        }
      } else if (options.exec === 'serve') {
        // ========== Serve mode ==========
        console.log('\n🏗️  [mainset cli] web-app: serve');

        try {
          if (options.serveMode === 'ssr') {
            // ========== [Serve] SSR mode ==========

            /*
            // Step 1: watch:ssr-server start ssr server
            runStreamingRslibCLICommand([
              'build',
              '--config',
              rslibSSRConfigPath,
              '--watch',
            ]);
            */

            // NOTE: node SSR server requires webpack to compile web app files first
            runStreamingInSync([
              // Step 2: watch:ssr-webapp source code of web app
              {
                runCommand: () =>
                  runStreamingCommand(
                    webpackCLICommandPath,
                    ['--config', webpackSSRConfigPath, '--watch'],
                    {
                      env: {
                        MS_CLI__WEBPACK_SERVE_MODE: 'ssr',
                      },
                    },
                  ),
                waitForOutput: 'compiled successfully',
              },
              // Step 3: start:ssr-server which is compiled web app and ssr-server code
              {
                runCommand: () =>
                  runStreamingCommand('node', [
                    '--watch', // Enable watch mode for {node}
                    ssrServerEntryPath,
                    '--ssrServerConfig',
                    ssrServerConfigCompiledPath,
                  ]),
              },
            ]);
          } else {
            // ========== [Serve] CSR mode ==========
            const webpackDevServerConfigPath = fs.existsSync(
              customWebpackConfigPath,
            )
              ? customWebpackConfigPath
              : path.resolve(
                  runtimePathById.root,
                  'node_modules',
                  '@mainset/bundler-webpack/dist/esm/webpack-config/dev-server.csr.config.mjs',
                );

            // Step 1: watch:csr-server / start:csr-server source code
            runStreamingCommand(
              webpackCLICommandPath,
              ['serve', '--config', webpackDevServerConfigPath, '--open'],
              {
                env: {
                  MS_CLI__WEBPACK_SERVE_MODE: 'csr',
                },
              },
            );
          }
        } catch (error) {
          initProcessCatchErrorLogger('web-app', error, 'watch');
        }
      } else if (options.exec === 'serve-static') {
        // ========== Serve static mode ==========
        console.log('\n🏗️  [mainset cli] web-app: serve-static');

        try {
          if (options.serveMode === 'ssr') {
            // ========== [Serve Static] SSR mode ==========

            // Step 1: start:ssr-server which is compiled web app and ssr-server code
            runStreamingCommand('node', [
              '--watch', // Enable watch mode for {node}
              ssrServerEntryPath,
              '--ssrServerConfig',
              ssrServerConfigCompiledPath,
            ]);
          } else {
            // ========== [Serve Static] CSR mode ==========

            // Step 1: determinate command params
            const serverEntryPath = path.resolve(
              runtimePathById.msCLISrc,
              '../services/serve-static/serve-static.mjs',
            );

            const customServeStaticMjsConfigPath = path.resolve(
              runtimePathById.root,
              options.config || './config/serve-static.config.mjs',
            );

            const customServeStaticJsonConfigPath = path.resolve(
              runtimePathById.root,
              './config/serve-static.config.json',
            );

            const serveStaticConfigPath =
              (fs.existsSync(customServeStaticMjsConfigPath) &&
                customServeStaticMjsConfigPath) ||
              (fs.existsSync(customServeStaticJsonConfigPath) &&
                customServeStaticJsonConfigPath) ||
              path.resolve(
                runtimePathById.msCLISrc,
                '../services/express-base-app/express-base-app.config.json',
              );

            // Step 2: serve static compiled files
            runStreamingCommand('node', [
              serverEntryPath,
              '--serveStaticConfig',
              serveStaticConfigPath,
            ]);
          }
        } catch (error) {
          initProcessCatchErrorLogger('web-app', error, 'serve-static');
        }
      } else {
        console.error(
          consoleColorize(
            'BRIGHT_YELLOW',
            `[mainset cli][web-app] Unknown exec mode: "${options.exec}"`,
          ),
        );
        process.exit(1);
      }
    });
}

export { registerWebAppCommand };
