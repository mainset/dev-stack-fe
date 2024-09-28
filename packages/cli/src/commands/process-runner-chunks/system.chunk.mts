import { runtimePathById } from '../../runtime/index.mjs';
import { execImmediateCommand } from '../../utils/index.mjs';

// Cleanup
function execPurgeDist() {
  console.log('🧹 Cleaning dist folder ...');

  execImmediateCommand(`rm -rf ${runtimePathById.dist}`);
}

export { execPurgeDist };
