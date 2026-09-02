#!/bin/bash

set -e

echo "DB migration started"
npm run db:deploy

echo "Redis clear started"
npm run redis:clear

echo "Starting application"
exec npm run start:prod