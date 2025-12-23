#!/usr/bin/env node
import { Command } from 'commander';

import {
  registerNodeSourcerCommand,
  registerSourceCodeCommand,
  registerWebAppCommand,
} from './commands/index.mjs';
import { verifyOrSetNodeEnv } from './utils/index.mjs';

// !IMPORTANT: Set NODE_ENV is case it is not passed
verifyOrSetNodeEnv();

const program = new Command();

program
  .name('ms-cli')
  .description('CLI to manage frontend tooling and infrastructure')
  .version('0.1.0');

registerSourceCodeCommand(program);
registerNodeSourcerCommand(program);
registerWebAppCommand(program);

program.parse(process.argv);
