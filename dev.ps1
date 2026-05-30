# dev.ps1
docker compose -f docker-compose.dev.yml up -d
# net start mosquitto
npm run dev
