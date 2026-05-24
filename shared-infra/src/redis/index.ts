/*******************************************************************************
 * Filename: index.ts
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
  ALERT_TRIGGER: 'alert:trigger',     // Triggered when readings are detected outside their threshold
  CONFIG_UPDATED: 'config:updated',   // Triggered when a sensor's configuration is updated
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
