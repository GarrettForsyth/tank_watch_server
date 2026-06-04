module.exports = {
  apps: [
    { name: 'gateway',              cwd: './gateway',              script: 'dist/index.js', env: { NODE_ENV: 'production' } },
    { name: 'core-api',             cwd: './core-api',             script: 'dist/index.js', env: { NODE_ENV: 'production' } },
    { name: 'readings-api',         cwd: './readings-api',         script: 'dist/index.js', env: { NODE_ENV: 'production' } },
    { name: 'consumer',             cwd: './consumer',             script: 'dist/index.js', env: { NODE_ENV: 'production' } },
    { name: 'notification-service', cwd: './notification-service', script: 'dist/index.js', env: { NODE_ENV: 'production' } },
  ]
}
