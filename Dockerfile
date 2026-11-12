# One Dockerfile for every Node service in the workspace.
# Build a specific service with:  --build-arg SERVICE=<workspace dir>
# (docker-compose.yml does this for each service.)

FROM node:22-bookworm-slim AS base
WORKDIR /app

# ---- Install all dependencies (dev included, needed to compile TypeScript) ----
FROM base AS deps
# better-sqlite3 is a native module; these let it compile if no prebuilt
# binary matches this Node version.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
# Copy only manifests first so this layer is cached until dependencies change.
COPY package.json package-lock.json ./
COPY gateway/package.json              gateway/
COPY shared-infra/package.json         shared-infra/
COPY core-api/package.json             core-api/
COPY readings-api/package.json         readings-api/
COPY consumer/package.json             consumer/
COPY notification-service/package.json notification-service/
RUN npm ci

# ---- Compile every workspace, then drop dev dependencies ----
FROM deps AS build
COPY . .
RUN npm run build -w shared-infra \
 && npm run build --workspaces --if-present \
 && npm prune --omit=dev

# ---- Runtime image for one service ----
FROM base AS runtime
ARG SERVICE
ENV NODE_ENV=production
# Mount point for persistent data (core-api's SQLite file). Created here so a
# fresh named volume inherits the non-root user's ownership.
RUN mkdir -p /data && chown node:node /data
COPY --from=build /app/node_modules         ./node_modules
COPY --from=build /app/shared-infra         ./shared-infra
COPY --from=build /app/${SERVICE}           ./${SERVICE}
WORKDIR /app/${SERVICE}
USER node
CMD ["node", "dist/index.js"]
