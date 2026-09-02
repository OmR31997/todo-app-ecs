#!/bin/sh

set -e

echo "======================================"
echo " Database Migration"
echo "======================================"

baseline_existing_schema() {
    echo "P3005: Existing schema detected."
    echo "Baselining migration history only."

    for dir in prisma/migrations/*/; do
        [ -d "$dir" ] || continue

        name=$(basename "$dir")

        [ -f "$dir/migration.sql" ] || continue

        echo "Marking migration as applied: $name"

        npx prisma migrate resolve --applied "$name"
    done
}

run_migrate_deploy() {
    npx prisma migrate deploy
}

if ! migrate_output=$(run_migrate_deploy 2>&1); then

    printf '%s\n' "$migrate_output"

    if printf '%s' "$migrate_output" | grep -q 'P3005'; then

        baseline_existing_schema

        echo "Running migrate deploy again..."

        run_migrate_deploy

    else
        echo "Database migration failed."
        exit 1
    fi

else
    printf '%s\n' "$migrate_output"
fi

echo "Database migration completed successfully."