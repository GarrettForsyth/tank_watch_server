# tankwatch-server

Backend infrastructure for TankWatch — an IoT aquarium monitoring system. This repo contains the broker and database configuration for the server, and will eventually contain the consumer and API services.

## What's in here

| File | Purpose |
|---|---|
| `docker-compose.yml` | Spins up Mosquitto and InfluxDB |
| `mosquitto.conf` | Broker configuration |
| `mosquitto_passwords` | Hashed credentials file — not committed, must be generated on the server |
| `mosquitto_passwords.example` | Documents the expected format and generation command |

## Prerequisites

- A Linux VPS (Ubuntu 24.04 recommended)
- Docker and Docker Compose installed
- Port 1883 (MQTT) and 8086 (InfluxDB, internal only) available

## Setup

### 1. Clone the repo

```bash
git clone git@github.com:yourusername/tankwatch-server.git
cd tankwatch-server
```

### 2. Start the containers

```bash
docker compose up -d
```

Verify both containers are running:

```bash
docker compose ps
```

### 3. Generate the Mosquitto password file

The broker requires authentication. Generate the password file on the host before enabling auth:

```bash
docker run --rm -it -v $(pwd):/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -c /mosquitto/config/mosquitto_passwords <username>
```

Replace `<username>` with your chosen username (e.g. `tankwatch`). You will be prompted to enter and confirm a password.

Then fix ownership and permissions so the Mosquitto container can read the file:

```bash
chown 1883:1883 mosquitto_passwords
chmod 0700 mosquitto_passwords
```

### 4. Restart Mosquitto to apply auth

```bash
docker compose restart mosquitto
```

Verify it started cleanly — you should see `mosquitto version 2.x.x running` with no errors:

```bash
docker compose logs mosquitto
```

### 5. Open firewall ports

On your VPS, ensure these ports are open inbound:

| Port | Protocol | Purpose |
|---|---|---|
| 22 | TCP | SSH |
| 1883 | TCP | MQTT broker |
| 443 | TCP | HTTPS API (future) |

InfluxDB (8086) should **not** be exposed externally. It is accessed only via localhost by the consumer and API services.

## Verifying the setup

You can verify the broker is reachable and auth is working using [MQTT Explorer](https://mqtt-explorer.com):

- Host: your server IP
- Port: `1883`
- Username/password: credentials you set in step 3

A successful connection confirms the broker is running and authentication is in place.

## Updating credentials

To add a new user (without wiping existing ones, use `-b` instead of `-c`):

```bash
docker run --rm -it -v $(pwd):/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -b /mosquitto/config/mosquitto_passwords <username> <password>
docker compose restart mosquitto
```

To change an existing user's password, run the same command with their username — it will overwrite their entry.

## Logs

```bash
docker compose logs mosquitto     # Mosquitto broker logs
docker compose logs influxdb      # InfluxDB logs
docker compose logs -f mosquitto  # Follow live
```

## Redeployment

After pulling changes:

```bash
git pull
docker compose up -d
```

If `mosquitto.conf` changed, restart the broker:

```bash
docker compose restart mosquitto
```
