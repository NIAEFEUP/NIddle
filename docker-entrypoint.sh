#!/bin/bash

set -e

echo "Running database schema creation..."
npm run schema:create

echo "Starting application..."
exec "$@"
