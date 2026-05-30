/**
 * File: index.ts 
 * Author: Garrett Forsyth
 * Date: May 3rd 2026
 * Description: Entry point: starts the consumer
 */

// Load the proper environment variables before anything else
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { startMqttConsumer } from './services/mqtt';
import { getSubscriber, CHANNELS } from '@tankwatch/shared-infra';
import { SensorConfigUpdated } from '@tankwatch/shared-infra';
import { invalidateConfig } from './services/configCache';

function startConfigWatcher(): void {
  const subscriber = getSubscriber();
  subscriber.subscribe(CHANNELS.SENSOR_CONFIG_UPDATED);

  subscriber.on('message', (channel: string, message: string) => {
    if (channel !== CHANNELS.SENSOR_CONFIG_UPDATED) return;

    try {
      const event: SensorConfigUpdated = JSON.parse(message);
      invalidateConfig(event.romAddress);
      console.log(`Config cache invalidated for sensor: ${event.romAddress}`);
    } catch {
      console.warn('Failed to parse config:updated event:', message);
    }
  });
}

startMqttConsumer();
startConfigWatcher();
