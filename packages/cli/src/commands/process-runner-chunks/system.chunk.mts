import fs from 'fs';

import { runtimePathById } from '../../runtime/index.mjs';

// Cleanup
function execImmediatePurgeDist() {
  console.log('🧹 Cleaning dist folder ...');

  fs.rmSync(runtimePathById.dist, { recursive: true, force: true });
}

export { execImmediatePurgeDist };
