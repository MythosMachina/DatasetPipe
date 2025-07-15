#!/usr/bin/env bash
# update.sh - update repository and dependencies

set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Pulling latest changes..."
git pull

cd dataset-harmonizer/webserver
npm install

echo "Update complete."
