module.exports = {
  apps: [
    { name: 'consumer', script: 'dist/index.js', cwd: '/root/tank_watch_server/consumer', env: { NODE_ENV: 'production' } },
    { name: 'api',      script: 'dist/index.js', cwd: '/root/tank_watch_server/api',      env: { NODE_ENV: 'production' } }
  ]
}
