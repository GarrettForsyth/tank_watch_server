#!/usr/bin/env bash
# Back up TankWatch data (SQLite + InfluxDB + server secrets) to the restic
# repo on Google Drive. Run nightly by tankwatch-backup.timer and by
# deploy.sh before each deploy.
#
# Usage: backup.sh [tag]   (default: nightly)
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

TAG="${1:-nightly}"
DUMP_DIR="$HOME/tankwatch-backups/dumps"
set -a; . "$HOME/.config/tankwatch/restic.env"; set +a

rm -rf "$DUMP_DIR"
mkdir -p "$DUMP_DIR/sqlite" "$DUMP_DIR/influx"

echo "Dumping SQLite..."
docker compose exec -T core-api node -e "
  require('better-sqlite3')('/data/tankwatch.db', { readonly: true })
    .backup('/data/backup.db')
    .then(() => process.exit(0), (e) => { console.error(e); process.exit(1) })"
docker compose cp core-api:/data/backup.db "$DUMP_DIR/sqlite/tankwatch.db"
docker compose exec -T core-api rm /data/backup.db

echo "Dumping InfluxDB..."
docker compose exec -T influxdb sh -c \
  'rm -rf /tmp/influx-backup && influx backup /tmp/influx-backup -t "$DOCKER_INFLUXDB_INIT_ADMIN_TOKEN"'
docker compose cp influxdb:/tmp/influx-backup/. "$DUMP_DIR/influx/"
docker compose exec -T influxdb rm -rf /tmp/influx-backup

echo "Dumping Mosquitto passwords..."
docker compose exec -T mosquitto cat /mosquitto/config/passwords > "$DUMP_DIR/mosquitto_passwords"

echo "Uploading..."
# Absolute paths so every snapshot mirrors the server's layout on restore.
restic backup --retry-lock 10m --tag "$TAG" "$DUMP_DIR" "$PWD/.env" "$PWD/secrets"
restic forget --retry-lock 10m --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune

# Verify the repo's integrity once a week (Sunday).
if [ "$(date +%u)" = 7 ]; then
  restic check --retry-lock 10m
fi
echo "Backup complete."
