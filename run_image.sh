#!/bin/bash
set -e

IMAGE_NAME="niddle"
CONTAINER_NAME="niddle"

NETWORK_NAME="niddle-network"

if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "⚠️  Network $NETWORK_NAME not found."
  echo "👉 Run 'docker compose up -d' first to start the database."
  exit 1
fi

echo "🚀 Starting container $CONTAINER_NAME on network $NETWORK_NAME ..."
docker run --rm -it \
  --name "$CONTAINER_NAME" \
  --network "$NETWORK_NAME" \
  --env-file .env.docker \
  -p 3000:3000 \
  "$IMAGE_NAME"
