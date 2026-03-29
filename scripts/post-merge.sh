#!/bin/bash
set -e

npm install --legacy-peer-deps

npm run db:push --if-present 2>/dev/null || true
