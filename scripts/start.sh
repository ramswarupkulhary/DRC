#!/bin/bash
set -e

echo "=== DRC Start Script ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO')"

echo "--- Running prisma db push ---"
npx prisma db push --skip-generate 2>&1 || {
  echo "WARNING: prisma db push failed, retrying in 5s..."
  sleep 5
  npx prisma db push --skip-generate 2>&1 || {
    echo "ERROR: prisma db push failed twice, starting anyway..."
  }
}

echo "--- Starting Next.js on port ${PORT:-3000} ---"
exec npx next start -H 0.0.0.0 -p ${PORT:-3000}
