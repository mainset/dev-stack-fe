# front-dev developer stack

**Mainset Dev Stack FE** is a modern front-end development stack designed to streamline the development of infrastructure, packages, web applications for mainset projects. It provides a unified CLI, bundling tools, and reusable configurations to accelerate development workflows.

# Table of Contents

- [Quick Start](#quick-start)
- [Packages Overview](#packages-overview)

## Quick Start

```bash
# Run complete setup after the repo been pulled
pnpm run s:i

# Run dev for all packages
pnpm run dev:packages

# Run dev for all web apps
pnpm run dev:apps
```

## Packages Overview

| Package                                              | Description                                             |
| ---------------------------------------------------- | ------------------------------------------------------- |
| [@mainset/dev-stack-fe](packages/dev-stack-fe)       | Dev Stack and Code Quality tools                        |
| [@mainset/cli](packages/cli)                         | CLI tool for managing builds and development workflows  |
| --------------------------------------------------   | ------------------------------------------------------- |
| [@mainset/builder-rslib](packages/builder-rslib)     | Utilities for building node packages                    |
| [@mainset/bundler-webpack](packages/bundler-webpack) | Utilities for bundling web applications                 |
| --------------------------------------------------   | ------------------------------------------------------- |
| [@mainset/toolkit-js](packages/toolkit-js)           | JS Utility functions and helpers                        |
