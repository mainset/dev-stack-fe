#!/bin/bash
set -e  # Exit on any error

preinstall() {
  # Step-1: Install "typescript" which is used in CLI to compile the {source-code}
  pnpm --filter @mainset/dev-stack-fe install

  # Step-2: Build the source-code of CLI
  pnpm --filter @mainset/cli install

  # pnpm --filter @mainset/cli run build
  pnpm run pre-build:compile--cli

  # NOTE: pnpm 11's "already up to date" fast-path trusts a cached workspace-state
  # marker and can skip re-linking node_modules/.bin even though @mainset/cli's dist
  # was just built above — bust that cache so the next {pnpm install} actually
  # (re)links the {ms-cli} bin into every package that depends on it.
  rm -f node_modules/.modules.yaml node_modules/.pnpm-workspace-state-v1.json
}

prebuild() {
  # Step-2: Pre Build the source-code of basic JS tools
  # pnpm --filter @mainset/toolkit-js run pre:compile
  pnpm run pre-build:compile--primitive-utils
}

setup_initial() {
  # Step-1: Steps required before {install} command could be run
  preinstall

  # Step-2: Install dependencies to register the CLI across monorepo
  pnpm install

  # Step-3: Steps required before {build:packages} command could be run
  prebuild

  # Step-4: Build packages
  pnpm run build:packages
}

# Parse the first argument as the function name
if [ -n "$1" ]; then
  FUNCTION_NAME=$1
  shift # Remove the first argument from the list

  # Check if the function exists and call it
  if declare -f "$FUNCTION_NAME" > /dev/null; then
    "$FUNCTION_NAME" "$@" # Pass remaining arguments to the function
  else
    echo "Error: Function \"$FUNCTION_NAME\" not found."
    exit 1
  fi
else
  echo "Error: No function name provided."
  exit 1
fi
