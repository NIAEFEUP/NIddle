#!/bin/sh

set -e

echo "Running database migrations..."
if [ -f "/app/apps/api/dist/database/migrate.js" ]; then
  node /app/apps/api/dist/database/migrate.js
elif [ -f "apps/api/dist/database/migrate.js" ]; then
  node apps/api/dist/database/migrate.js
elif [ -f "dist/database/migrate.js" ]; then
  node dist/database/migrate.js
else
  npm run migration:run
fi

echo "Starting application..."
exec "$@"
