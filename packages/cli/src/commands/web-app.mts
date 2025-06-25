import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

import {
  resolveHostPackageBinForCLICommandPath,
  runtimePathById,
} from '../runtime/index.mjs';
import {
  consoleColorize,
  execImmediateCommand,
  initProcessCatchErrorLogger,
  runStreamingCommand,
} from '../utils/index.mjs';
import {
  execPurgeDist,
  execRslibCLICommand,
  runRslibCLICommand,
} from './process-runner-chunks/index.mjs';

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
    .action(async (options) => {
      // Step 0: determinate command params
      const customWebpackConfigPath = path.resolve(
        runtimePathById.root,
        options.config || './config/webpack.config.mjs',
      );

      // Webpack paths
      const webpackCLICommandPath =
        await resolveHostPackageBinForCLICommandPath(
          '@mainset/bundler-webpack',
          'webpack',
          'webpack',
        );
      const webpackSSRConfigPath = fs.existsSync(customWebpackConfigPath)
        ? customWebpackConfigPath
        : path.resolve(
            runtimePathById.root,
            'node_modules',
            '@mainset/bundler-webpack/dist/esm/webpack-config/webapp.ssr.config.mjs',
          );

      const rslibSSRConfigPath = path.resolve(
        runtimePathById.root,
        'node_modules',
        '@mainset/builder-rslib/dist/esm/rslib.ssr-server.config.mjs',
      );

      if (options.exec === 'build') {
        // ========== Build mode ==========
        console.log('\n🏗️  [mainset cli] web-app: build');

        try {
          if (options.serveMode === 'ssr') {
            // ========== [Build] SSR mode ==========

            // Step 1: purge dist folder
            execPurgeDist();

            // Step 2: build:ssr-webapp source code
            console.log('\n📦 Compiling SSR WebApp with Webpack ...');
            execImmediateCommand(
              `node ${webpackCLICommandPath} --config ${webpackSSRConfigPath}`,
            );

            // Step 3: build:ssr-server source code
            console.log('\n📦 Compiling SSR Server with Rslib ...');
            await execRslibCLICommand(`build --config ${rslibSSRConfigPath}`);

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
            execPurgeDist();

            // Step 2: build:csr-webapp source code
            console.log('\n📦 Compiling CSR WebApp with Webpack ...');
            execImmediateCommand(
              `node ${webpackCLICommandPath} --config ${webpackCSRConfigPath}`,
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

            const ssrServerEntryPath = path.resolve(
              runtimePathById.msCLISrc,
              '../services/ssr-server/ssr-server.mjs',
            );
            const ssrServerConfigCompiledPath = path.resolve(
              runtimePathById.dist,
              './private/ssr-server.config.mjs',
            );

            // Step 1: watch:ssr-server start ssr server
            await runRslibCLICommand([
              'build',
              '--config',
              rslibSSRConfigPath,
              '--watch',
            ]);

            // Step 2: watch:ssr-webapp source code of web app
            runStreamingCommand('node', [
              webpackCLICommandPath,
              '--config',
              webpackSSRConfigPath,
              '--watch',
            ]);

            // Step 3: start:ssr-server which is compiled web app and ssr-server code
            runStreamingCommand('node', [
              '--watch', // Enable watch mode for {node}
              ssrServerEntryPath,
              '--ssrServerConfig',
              ssrServerConfigCompiledPath,
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
            runStreamingCommand('node', [
              webpackCLICommandPath,
              'serve',
              '--config',
              webpackDevServerConfigPath,
              '--open',
            ]);
          }
        } catch (error) {
          initProcessCatchErrorLogger('web-app', error, 'watch');
        }
      } else if (options.exec === 'serve-static') {
        // ========== Serve static mode ==========
        console.log('\n🏗️  [mainset cli] web-app: serve-static');

        try {
          // Step 1: determinate command params
          const serverEntryPath = path.resolve(
            runtimePathById.msCLISrc,
            '../services/serve-static/serve-static.mjs',
          );

          const customServeStaticConfigPath = path.resolve(
            runtimePathById.root,
            options.config || './config/serve-static.config.json',
          );
          const serveStaticConfigPath = fs.existsSync(
            customServeStaticConfigPath,
          )
            ? customServeStaticConfigPath
            : path.resolve(
                runtimePathById.msCLISrc,
                '../services/express-base-app/express-base-app.config.json',
              );

          // Step 2: serve static compiled files
          runStreamingCommand('node', [
            serverEntryPath,
            '--serveStaticConfig',
            serveStaticConfigPath,
          ]);
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
