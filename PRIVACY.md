# Privacy Policy

TankWatch Backup is a personal tool, used only by its owner, that backs up the
TankWatch server to the owner's Google Drive.

- **Access:** it requests only the `drive.file` scope, so it can access only the
  files it creates. It cannot see anything else in the owner's Google Drive.
- **Data:** backups contain TankWatch data (sensor readings, device and sensor
  configuration) and server configuration. They are encrypted with
  [restic](https://restic.net) before upload, so Google stores only encrypted data.
- **Sharing:** no data is shared with, sold to, or accessible by anyone else.

Questions: open an issue at https://github.com/GarrettForsyth/tank_watch_server/issues.
