import dotenv from '@dotenvx/dotenvx';

function initDotenv() {
  // Load environment-specific .env file
  return dotenv.config();
}

// REVIEW: investigate if {.env} file need's to be loaded during {source-code} / {node-sourcer} compilation
// Auto-execute configuration
// initDotenv();

export { initDotenv };
