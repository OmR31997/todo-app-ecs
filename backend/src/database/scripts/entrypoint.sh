#!/bin/sh

set -e

echo "======================================"
echo " Application Startup"
echo "======================================"

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"

if [ -n "${WRITER_DB_URL:-}" ]; then
    export DATABASE_URL="${DATABASE_URL:-$WRITER_DB_URL}"
    export DIRECT_URL="${DIRECT_URL:-$WRITER_DB_URL}"
fi

echo "Running database migration..."

sh /safe-migration.sh

echo "Clearing Redis..."
npm run redis:clear

echo "Starting application..."

exec npm run start:prod