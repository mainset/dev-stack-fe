import { runtimePathById } from '../../runtime/index.mjs';
import { execImmediateCommand } from '../../utils/index.mjs';

// Cleanup
function execImmediatePurgeDist() {
  console.log('🧹 Cleaning dist folder ...');

  execImmediateCommand(`rm -rf ${runtimePathById.dist}`);
}

export { execImmediatePurgeDist };
