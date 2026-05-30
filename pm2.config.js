module.exports = {
  apps: [
    { name: 'gateway',              cwd: './gateway',              script: '/root/tank_watch_server/gateway', env: { NODE_ENV: 'production' } },
    { name: 'core-api',             cwd: './core-api',             script: '/root/tank_watch_server/core-api', env: { NODE_ENV: 'production' } },
    { name: 'readings-api',         cwd: './readings-api',         script: '/root/tank_watch_server/readings-api', env: { NODE_ENV: 'production' } },
    { name: 'consumer',             cwd: './consumer',             script: '/root/tank_watch_server/consumer', env: { NODE_ENV: 'production' } },
    { name: 'notification-service', cwd: './notification-service', script: '/root/tank_watch_server/notification-service', env: { NODE_ENV: 'production' } },
  ]
}
