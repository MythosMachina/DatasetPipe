#!/usr/bin/env bash
# start.sh - launch Dataset Harmonizer web server

set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
WEB_DIR="$SCRIPT_DIR/dataset-harmonizer/webserver"

cd "$WEB_DIR"
node server.js
