import path from 'path';

import {
  resolveHostPackageBinForCLICommandPath,
  runtimePathById,
} from '../../runtime/index.mjs';
import {
  execImmediateCommand,
  runStreamingCommand,
} from '../../utils/index.mjs';

function getTscCLICommandPath() {
  const tscCLICommandPath = resolveHostPackageBinForCLICommandPath(
    '@mainset/dev-stack-fe',
    'tsc',
  );

  return tscCLICommandPath;
}

// Source code
function execTypeScriptCompileSourceCode({
  configPath,
}: {
  configPath: string;
}) {
  const tscCLICommandPath = getTscCLICommandPath();

  console.log('\n📦 Compiling Source Code with TypeScript ...');
  execImmediateCommand(`${tscCLICommandPath} --project ${configPath}`);
}

function runTypeScriptCompileSourceCode({
  configPath,
}: {
  configPath: string;
}) {
  const tscCLICommandPath = getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in watch mode ...');
  runStreamingCommand(tscCLICommandPath, ['--project', configPath, '--watch']);
}

// Type only
function getTypeScriptTypeOnlyConfigPath() {
  const customTypeScriptTypeOnlyConfigPath = path.join(
    runtimePathById.root,
    './tsconfig.build-type.json',
  );

  return {
    configPath: customTypeScriptTypeOnlyConfigPath,
  };
}

function execTypeScriptCompileTypeOnly() {
  const { configPath } = getTypeScriptTypeOnlyConfigPath();
  const tscCLICommandPath = getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in build mode ...');
  execImmediateCommand(`${tscCLICommandPath} --project ${configPath}`);
}

function runTypeScriptCompileTypeOnly() {
  const { configPath } = getTypeScriptTypeOnlyConfigPath();
  const tscCLICommandPath = getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in watch mode ...');
  runStreamingCommand(tscCLICommandPath, ['--project', configPath, '--watch']);
}

export {
  execTypeScriptCompileSourceCode,
  execTypeScriptCompileTypeOnly,
  runTypeScriptCompileSourceCode,
  runTypeScriptCompileTypeOnly,
};
