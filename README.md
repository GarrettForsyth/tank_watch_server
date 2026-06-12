# TankWatch — Server

TankWatch is a personal IoT aquarium monitoring system. I'm building it to collect data to help me understand what's 'really' happening inside my aquarium. I hope for it to one day give me insight into why my fish and plants thrive.. or not. Plus it's a fun intersection between my interest in coding and fishkeeping.

Right now, the key features are:
- Visualizing historical sensor data through a mobile client app 
- Receiving alert notifications when sensor readings breach a configured threshold

The idea is sensors connected to an ESP32 board publish to an MQTT broker hosted in the cloud. The backend monitors incoming readings and alerts the mobile client when they breach their configured threshold. The backend also offers an API for the mobile client to gather historical sensor data.

This repo contains the backend: Node.js/TypeScript microservices, a Mosquitto MQTT broker, InfluxDB for time-series data, SQLite for config, and Redis as an internal event bus.

**Related repos:** [tankwatch-android](https://github.com/garrettforsyth/tankwatch-android) · [tankwatch-firmware](https://github.com/garrettforsyth/tankwatch-firmware)

---

## Demo

![TankWatch Demo](docs/tankwatch_demo.gif)

---

## Overview
The backend has taken an event-driven microservice approach. Currently the backend handles sensor readings published by device sensors, provides data to the mobile client app, and alerts the client app when reading thresholds are breached.

For simplicity, all backend services and infastructure are deployed on a single VPS (Digital Ocean). Though this is a personal project with limited data volume, design decisions were made with reliability, scalability, and maintainability in mind: 

- The microservice approach offers resilience; a fault in one service doesn't bring down the others. 
- It also offers scalability, since services could be distributed across machines or scaled independently as load grows (the consumer, for example, could be replicated horizontally to handle higher reading volume without touching any other service). 
- It is also maintainable; Each service also owns a single responsibility and a single data store: core-api owns SQLite, readings-api owns InfluxDB, the gateway owns nothing (which keeps each component focused and independently understandable)

Roadmap:
- Additional sensor support: water level, total dissolved solids (TDS), pH
- Authentication: currently stubbed - intend on using Clerk
- Device provisioning flow
- Sensor configuration

## Architecture / Data Flow

![Architecture diagram](docs/tankwatch_flows.png)

### Normal reading (every 30 seconds)
1. ESP32 reads DS18B20, publishes `{ "value": 24.0625 }` to `tankwatch/{deviceId}/readings/temperature/ds18b20/{romAddress}`
2. Consumer writes measurement to InfluxDB
3. Consumer evaluates against cached thresholds
4. In range → done. Breach → `sensor:breach` → core-api enriches → `notification:dispatch` → notification-service checks cooldown → FCM

### Config update
1. Android calls `PUT /api/sensors/:id/config`
2. Core-api writes to SQLite, publishes fat `sensor:config-updated` event to Redis
3. Consumer updates in-memory threshold cache directly from event payload — no re-fetch

---

### Services

| Service | Role |
|---|---|
| **gateway** | Backend-for-Frontend pattern (BFF), only externally exposed service. Proxies `/api/*` to core-api and readings-api. |
| **core-api** | Owns SQLite — devices, sensors, config, FCM tokens. Handles breach enrichment (gathers details for breach notification) and config updates. |
| **readings-api** | Thin InfluxDB query layer. Read-only time-series access. |
| **consumer** | Subscribes to MQTT, writes readings to InfluxDB, evaluates thresholds, publishes breach events to Redis. |
| **notification-service** | Subscribes to Redis `notification:dispatch`, applies 30-minute cooldown per sensor/direction, sends FCM. |

### Infrastructure (Docker)

| Component | Role |
|---|---|
| Mosquitto | MQTT broker — receives ESP32 publishes |
| InfluxDB v2 | Time-series readings |
| Redis | Internal pub/sub event bus |
| SQLite | Domain store — not containerized, flat file on disk |

### Firewall (production VPS)

Only four ports are open externally:

| Port | Purpose |
|---|---|
| 22 | SSH |
| 80 | HTTP (nginx — Certbot verification + HTTP→HTTPS redirect) |
| 443 | HTTPS API (nginx → gateway:3000) |
| 1883 | MQTT (ESP32 publishes) |

---

## API Endpoints

All routes go through the gateway (`https://tankwatch.duckdns.org`).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/devices` | List devices for the current user |
| `GET` | `/api/devices/:id/sensors` | List sensors for a device |
| `GET` | `/api/readings` | Time-series readings (`?romAddress=&measurementType=&range=`) |
| `GET` | `/api/sensors/:id/config` | Sensor threshold config |
| `PUT` | `/api/sensors/:id/config` | Upsert sensor threshold config |
| `PUT` | `/api/notifications/token` | Register/update FCM push token |

---

## Local Development

### Prerequisites

- Node.js 22
- Docker Desktop
- Mosquitto installed natively on Windows (Docker's WSL2 networking stack prevents ESP32 from reaching a containerized broker)

### 1. Clone and install

```bash
git clone https://github.com/garrettforsyth/tank_watch_server
cd tank_watch_server
npm install        # always from the root — never from a sub-package
```

### 2. Environment files

Each service reads from `.env.development`. Copy the examples and fill in your values:

```bash
cp notification-service/.env.example notification-service/.env.development
```

**core-api** `.env.development`:
```
SQLITE_DB_PATH=../tankwatch.db
```

**notification-service** `.env.development`:
```
REDIS_HOST=localhost
REDIS_PORT=6379
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Place your Firebase service account JSON at `notification-service/firebase-service-account.json` (gitignored via `*adminsdk*`).

### 3. Start infrastructure

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts InfluxDB (port 8086) and Redis (port 6379). Start Mosquitto natively:

```bash
net start mosquitto      # Windows
```

### 4. Migrate and seed the database

```bash
npm run db:migrate -w core-api
npm run db:seed -w core-api
```

If you need to re-seed, delete `tankwatch.db` first.

### 5. Start all services

```bash
npm run dev
```

This builds `shared-infra` first (via `predev`), then starts all five services concurrently.

To run a single service:

```bash
npm run dev -w core-api
npm run dev -w consumer
```

### Useful commands

```bash
npm run db:studio -w core-api        # Drizzle Studio at localhost:4983
npm run typecheck --workspaces       # type-check all packages
npm run test --workspaces            # run all tests
```

---

## Tests

Vitest across `consumer`, `core-api`, and `readings-api`.

```bash
npm run test --workspaces --if-present
```

- **consumer** — `AlertEvaluator` unit tests (pure function, no I/O)
- **core-api** — Zod schema unit tests + supertest integration tests against in-memory SQLite
- **readings-api** — Zod schema unit tests

---

## Deployment

The production VPS is a DigitalOcean 1GB/25GB Ubuntu 24.04 droplet running at `tankwatch.duckdns.org`.

### Services managed by pm2

```bash
pm2 start pm2.config.js
pm2 save
pm2 status
```

### Infrastructure managed by Docker

```bash
docker compose up -d      # Mosquitto + InfluxDB + Redis
```

### CI/CD

GitHub Actions runs on push to `main`:

1. `npm ci` → typecheck → Vitest
2. On success: SSH into VPS, `git pull`, `npm ci`, `pm2 restart all`

Secrets required: `VPS_HOST`, `VPS_SSH_KEY`.

> **Note:** `npm ci` on the VPS recompiles `better-sqlite3`. If space is an issue, a swap file is recommended before the pipeline runs — verify with `swapon --show`.

---


## Tech Stack

| | |
|---|---|
| Runtime | Node.js 22 / TypeScript |
| Services | Express |
| Time-series DB | InfluxDB v2 |
| Config DB | SQLite (Drizzle ORM) |
| Event bus | Redis (ioredis) |
| MQTT broker | Mosquitto |
| Push notifications | Firebase Cloud Messaging |
| Package management | npm workspaces |
| Tests | Vitest + supertest |
| Process manager | pm2 |
| Reverse proxy / SSL | nginx + Let's Encrypt (Certbot) |
| CI/CD | GitHub Actions |
| VPS | DigitalOcean Toronto ($6/month) |
