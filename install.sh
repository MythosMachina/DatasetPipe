#!/usr/bin/env bash
# install.sh - setup Dataset Harmonizer webserver dependencies

set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
WEB_DIR="$SCRIPT_DIR/dataset-harmonizer/webserver"

echo "Installing Node.js dependencies..."
cd "$WEB_DIR"
npm install

echo "Installation complete."
