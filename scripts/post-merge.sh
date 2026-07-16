#!/bin/bash
set -e

npm install --legacy-peer-deps

# Database migrations are handled automatically at server startup via runStartupMigrations() in server/index.ts
# drizzle-kit push is intentionally omitted — it requires an interactive prompt and a Neon branching API
# endpoint that is not available in this environment, causing deployment failures.
