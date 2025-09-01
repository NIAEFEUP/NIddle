#!/bin/bash

set -e

IMAGE_NAME='niddle'

echo "📦 Building Docker image: $IMAGE_NAME ..."
docker build -t $IMAGE_NAME .
echo "✅ Build finished"
