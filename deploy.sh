#!/usr/bin/env bash
# Deploy the latest `main` on this host.
#
# Run by CI over SSH (the CI key is locked to this script in
# ~/.ssh/authorized_keys), or by hand. Safe to re-run.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

# Don't block on failed backups to avoid blocking fixes on crash loops
./backup.sh pre-deploy || echo "WARNING: pre-deploy backup failed; deploying anyway."

git pull --ff-only origin main
docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null
docker compose ps
