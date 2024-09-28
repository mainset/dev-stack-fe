import path from 'path';

import {
  resolveHostPackageBinForCLICommandPath,
  runtimePathById,
} from '../../runtime/index.mjs';
import {
  execImmediateCommand,
  runStreamingCommand,
} from '../../utils/index.mjs';

async function getTscCLICommandPath() {
  const tscCLICommandPath = await resolveHostPackageBinForCLICommandPath(
    '@mainset/dev-stack-fe',
    'typescript',
    'tsc',
  );

  return tscCLICommandPath;
}

// Source code
async function execTypeScriptCompileSourceCode({
  configPath,
}: {
  configPath: string;
}) {
  const tscCLICommandPath = await getTscCLICommandPath();

  console.log('\n📦 Compiling Source Code with TypeScript ...');
  execImmediateCommand(`node ${tscCLICommandPath} --project ${configPath}`);
}

async function runTypeScriptCompileSourceCode({
  configPath,
}: {
  configPath: string;
}) {
  const tscCLICommandPath = await getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in watch mode ...');
  runStreamingCommand('node', [
    tscCLICommandPath,
    '--project',
    configPath,
    '--watch',
  ]);
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

async function execTypeScriptCompileTypeOnly() {
  const { configPath } = getTypeScriptTypeOnlyConfigPath();
  const tscCLICommandPath = await getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in build mode ...');
  execImmediateCommand(`node ${tscCLICommandPath} --project ${configPath}`);
}

async function runTypeScriptCompileTypeOnly() {
  const { configPath } = getTypeScriptTypeOnlyConfigPath();
  const tscCLICommandPath = await getTscCLICommandPath();

  console.log('\n📝 Compiling .d.ts Types in watch mode ...');
  runStreamingCommand('node', [
    tscCLICommandPath,
    '--project',
    configPath,
    '--watch',
  ]);
}

export {
  execTypeScriptCompileSourceCode,
  execTypeScriptCompileTypeOnly,
  runTypeScriptCompileSourceCode,
  runTypeScriptCompileTypeOnly,
};
