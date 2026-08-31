#!/bin/sh

set -e

# TODO: Add automated migration execution here (e.g. `npm run migration:run`)
# The legacy manual `schema:create` script was removed because development uses automatic
# entity synchronization on startup, and production will rely on automated migrations.

echo "Starting application..."
exec "$@"
