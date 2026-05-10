# tankwatch-server

Backend infrastructure for TankWatch — an IoT aquarium monitoring system. This repo contains the broker and database configuration, the consumer service that bridges MQTT into InfluxDB, and the Express REST API that serves data to the Android app.

## What's in here

| Path | Purpose |
|---|---|
| `docker-compose.yml` | Production: spins up Mosquitto and InfluxDB |
| `docker-compose.dev.yml` | Local dev: spins up InfluxDB only |
| `mosquitto.conf` | Broker configuration (used by Docker and native installs) |
| `mosquitto_passwords` | Hashed credentials file — not committed, must be generated on the server |
| `mosquitto_passwords.example` | Documents the expected format and generation command |
| `pm2.config.js` | pm2 process definitions for production |
| `tankwatch.db` | SQLite database — not committed, created automatically on first run |
| `shared/` | `@tankwatch/shared` — SQLite schema, migrations, and db connection shared across packages |
| `consumer/` | Node.js/TypeScript service — subscribes to MQTT, writes to InfluxDB |
| `api/` | Node.js/TypeScript Express API — serves readings and config to the Android app |

---

## Local Development

Local dev runs InfluxDB in Docker and Mosquitto natively on the host machine. This avoids WSL2 networking issues that prevent external devices (ESP32) from reaching containerised Mosquitto on Windows.

### Prerequisites

- Docker and Docker Compose
- Node.js 22+
- Mosquitto installed natively on Windows ([mosquitto.org](https://mosquitto.org/download/))

### 1. Configure native Mosquitto

Edit `C:\Program Files\Mosquitto\mosquitto.conf`:

```
listener 1883
allow_anonymous false
password_file C:\Users\<YourUsername>\mosquitto\mosquitto_passwords

persistence true
persistence_location C:\Users\<YourUsername>\mosquitto\data\
log_dest file C:\Users\<YourUsername>\mosquitto\log\mosquitto.log
```

Create the required directories and generate the password file (run PowerShell as Administrator):

```powershell
mkdir "C:\Users\<YourUsername>\mosquitto\log"
mkdir "C:\Users\<YourUsername>\mosquitto\data"
cd "C:\Program Files\Mosquitto"
.\mosquitto_passwd -c "C:\Users\<YourUsername>\mosquitto\mosquitto_passwords" tankwatch
```

Start the Mosquitto service:

```powershell
net start mosquitto
```

### 2. Start local InfluxDB

```bash
docker compose -f docker-compose.dev.yml up -d
```

On first run, visit `http://localhost:8086` and complete the initial setup:
- Create an organisation (e.g. `tankwatch`)
- Create a bucket (e.g. `tankwatch`)
- Copy the generated API token — you will not see it again without regenerating

### 3. Configure the consumer

```bash
cd consumer
cp .env.example .env.development
```

Fill in `.env.development` with your local values:

```
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=tankwatch
MQTT_PASSWORD=<your mosquitto password>

INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=<your influxdb token>
INFLUXDB_ORG=tankwatch
INFLUXDB_BUCKET=tankwatch
```

### 4. Configure the API

```bash
cd api
cp .env.example .env.development
```

Fill in `.env.development`:

```
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=<your influxdb token>
INFLUXDB_ORG=tankwatch
INFLUXDB_BUCKET=tankwatch

SQLITE_DB_PATH=../tankwatch.db

PORT=3000
```

### 5. Install dependencies

Always install from the repo root — this ensures npm workspaces hoists all dependencies correctly and prevents duplicate installs of shared packages like `drizzle-orm`:

```bash
cd tank_watch_server
npm install
```

Never run `npm install` from inside a sub-package (`consumer/`, `api/`, `shared/`) — this can create nested `node_modules` and break shared dependency resolution.

### 6. Run the database migration

On first run, or after any schema change, apply pending migrations from the `shared` package:

```bash
npm run db:migrate -w shared
```

This creates `tankwatch.db` at the repo root if it doesn't exist, then applies all pending migrations. See [Database Migrations](#database-migrations) for more detail.

### 7. Run the services

```bash
# Consumer (terminal 1)
npm run dev -w consumer

# API (terminal 2)
npm run dev -w api
```

You should see the consumer output:
```
Connected to MQTT broker
Subscribed to tankwatch/#
```

Readings from the ESP32 will appear as they arrive:
```
[A4CF12345678] temperature/ds18b20: 24.06°C
```

The API will be available at `http://localhost:3000`.

---

## Database Migrations

The SQLite database (`tankwatch.db`) lives at the repo root, shared between the consumer and API. Schema is managed with [Drizzle ORM](https://orm.drizzle.team). The schema source of truth is `shared/src/db/schema.ts` — Drizzle diffs it to generate migration SQL files.

All database tooling is run from the `shared` package:

```bash
# After editing shared/src/db/schema.ts:
npm run db:generate -w shared   # generates a new SQL file in shared/src/db/migrations/
npm run db:migrate -w shared    # applies pending migrations to tankwatch.db

# Inspect the database interactively:
npm run db:studio -w shared     # opens Drizzle Studio in the browser
```

Generated migration files live in `shared/src/db/migrations/` and are committed to git. **Never edit or delete a migration file after it has been applied** — Drizzle tracks applied migrations by filename. To undo a change, edit `schema.ts` back to the desired state and generate a new migration.

The `migrations/meta/` directory must also be committed — Drizzle uses it to diff the schema for the next migration.

---

## Production Deployment (VPS)

All services run on a single Linux VPS via Docker and pm2. Ubuntu 24.04 is recommended.

### Prerequisites

- A VPS with Docker, Docker Compose, Node.js 22, and pm2 installed
- `build-essential` installed — required for `better-sqlite3` to compile from source:
  ```bash
  apt-get install -y build-essential
  ```
- A swap file is recommended on 1GB RAM droplets — native module compilation is memory-intensive:
  ```bash
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  ```
- Ports 22, 1883, and 443 open inbound in your firewall
- InfluxDB (8086) must **not** be exposed externally

### 1. Clone the repo

```bash
git clone git@github.com:yourusername/tankwatch-server.git
cd tankwatch-server
```

### 2. Install dependencies

Always install from the repo root:

```bash
npm install
```

### 3. Start the containers

```bash
docker compose up -d
```

Verify both containers are running:

```bash
docker compose ps
```

### 4. Generate the Mosquitto password file

```bash
docker run --rm -it -v $(pwd):/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -c /mosquitto/config/mosquitto_passwords tankwatch
```

Fix ownership and permissions so the Mosquitto container can read the file:

```bash
chown 1883:1883 mosquitto_passwords
chmod 0700 mosquitto_passwords
```

### 5. Restart Mosquitto to apply auth

```bash
docker compose restart mosquitto
```

Verify it started cleanly — you should see `mosquitto version 2.x.x running` with no errors:

```bash
docker compose logs mosquitto
```

### 6. Set up InfluxDB

SSH tunnel to access the InfluxDB UI from your local machine:

```bash
ssh -L 8086:localhost:8086 root@your_droplet_ip
```

Then visit `http://localhost:8086` and complete the initial setup:
- Create an organisation (e.g. `tankwatch`)
- Create a bucket (e.g. `tankwatch`)
- Copy the generated API token

### 7. Configure the consumer

Create `.env.production` in `consumer/`:

```
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=tankwatch
MQTT_PASSWORD=<your mosquitto password>

INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=<your influxdb token>
INFLUXDB_ORG=tankwatch
INFLUXDB_BUCKET=tankwatch
```

Build the consumer:

```bash
cd consumer && npm run build && cd ..
```

### 8. Configure the API

Create `.env.production` in `api/`:

```
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=<your influxdb token>
INFLUXDB_ORG=tankwatch
INFLUXDB_BUCKET=tankwatch

SQLITE_DB_PATH=../tankwatch.db

PORT=3000
```

Build the API:

```bash
cd api && npm run build && cd ..
```

### 9. Run the database migration

```bash
npm run db:migrate -w shared
```

Lock down the database file so only the process owner can read it:

```bash
chmod 600 tankwatch.db
```

### 10. Start all services with pm2

From the repo root:

```bash
pm2 start pm2.config.js
pm2 save
```

Verify both processes are running:

```bash
pm2 status
pm2 logs consumer
pm2 logs api
```

### 11. Configure pm2 to start on reboot (one-time setup)

```bash
pm2 startup
```

Run the command it outputs, then:

```bash
pm2 save
```

---

## Verifying the setup

Use [MQTT Explorer](https://mqtt-explorer.com) to verify the broker is reachable and auth is working:

- Host: your server IP
- Port: `1883`
- Username/password: credentials you set during setup

Use the InfluxDB UI (`http://localhost:8086` via SSH tunnel on VPS, or directly on local dev) to verify readings are landing in the Data Explorer.

Use Drizzle Studio to inspect the SQLite database:

```bash
npm run db:studio -w shared
```

---

## Updating credentials

To add a new Mosquitto user without wiping existing ones:

```bash
docker run --rm -it -v $(pwd):/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -b /mosquitto/config/mosquitto_passwords <username> <password>
docker compose restart mosquitto
```

To change an existing user's password, run the same command with their username — it will overwrite their entry.

---

## Logs

```bash
# Docker services
docker compose logs mosquitto        # Mosquitto broker logs
docker compose logs influxdb         # InfluxDB logs
docker compose logs -f mosquitto     # Follow live

# pm2 services
pm2 logs consumer                    # Consumer logs
pm2 logs api                         # API logs
pm2 logs                             # All process logs
pm2 status                           # Overview of all processes
```

---

## Redeployment

After pulling changes:

```bash
git pull
npm install
cd consumer && npm run build && cd ..
cd api && npm run build && cd ..

# Only if there are new migrations:
npm run db:migrate -w shared

pm2 restart all
pm2 save
```

If `mosquitto.conf` changed:

```bash
docker compose restart mosquitto
```
