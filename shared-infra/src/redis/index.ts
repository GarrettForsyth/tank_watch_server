/*******************************************************************************
 * Filename: redis/index.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 24th 2026
 * Description: Redis set up for tankwatch.
 *
 * Redis is used for server side projects to communicate with each other. This
 * keeps the concerns of each project clean.
 ******************************************************************************/
import Redis from 'ioredis';

export const CHANNELS = {
  SENSOR_BREACH: 'sensor:breach',                             // Breach detected
  NOTIFICATION_DISPATCH: 'notification:dispatch',             // FCM Notification requested
  SENSOR_CONFIG_UPDATED: 'sensor:config-updated',             // Sensor's threshold changes
} as const;

let publisherInstance: Redis | null = null;
let subscriberInstance: Redis | null = null;

function createClient(): Redis {
  return new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
  });
}

export function getPublisher(): Redis {
  if (!publisherInstance) {
    publisherInstance = createClient();
  }
  return publisherInstance;
}

export function getSubscriber(): Redis {
  if (!subscriberInstance) {
    subscriberInstance = createClient();
  }
  return subscriberInstance;
}
