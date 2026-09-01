#!/bin/bash
set -e

echo "=== DRC Start Script ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO')"
echo "Working directory: $(pwd)"
echo "node_modules/.bin contents:"
ls node_modules/.bin/prisma node_modules/.bin/next 2>&1 || echo "(not found in node_modules/.bin)"

echo "--- Running prisma db push ---"
node_modules/.bin/prisma db push 2>&1 || {
  echo "WARNING: prisma db push failed, retrying in 5s..."
  sleep 5
  node_modules/.bin/prisma db push 2>&1 || {
    echo "ERROR: prisma db push failed twice, starting anyway..."
  }
}

echo "--- Checking .next directory ---"
ls -la .next/BUILD_ID 2>&1 || echo "WARNING: .next/BUILD_ID not found!"

echo "--- Starting Next.js on port ${PORT:-3000} ---"
exec node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}
