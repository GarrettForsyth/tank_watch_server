/*******************************************************************************
 * Filename: configCache.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 24th 2026
 * Description: A cache for sensor configurations.
 *
 * The consumer needs to know up to date data on the sensor configuration 
 * thresholds. To avoid hitting the database too much, a cache is kept and
 * updated when configuration updates are recived on redis.
 ******************************************************************************/
import { db } from '@tankwatch/shared-db/src/db/index';
import { sensors, sensorConfig } from '@tankwatch/shared-db/src/db/schema';
import { eq } from 'drizzle-orm';

export type CachedSensorConfig = {
  sensorId: number
  notificationsEnabled: boolean
  minValue: number | null
  maxValue: number | null
}

type ConfigCache = Map<string, CachedSensorConfig> // romAddress to config

const cache: ConfigCache = new Map();

export function loadConfig(romAddress: string): void {
  const row = db
    .select({
      sensorId:             sensorConfig.sensorId,
      notificationsEnabled: sensorConfig.notificationsEnabled,
      minValue:             sensorConfig.minValue,
      maxValue:             sensorConfig.maxValue,
    })
    .from(sensorConfig)
    .innerJoin(sensors, eq(sensors.id, sensorConfig.sensorId))
    .where(eq(sensors.romAddress, romAddress))
    .get();

  if (!row) return; // no config set yet — leave cache empty for this sensor

  cache.set(romAddress, row);
}

export function getConfig(romAddress: string): CachedSensorConfig | null {
  return cache.get(romAddress) ?? null;
}

export function invalidateConfig(romAddress: string): void {
  cache.delete(romAddress);
  loadConfig(romAddress);
}

export function invalidateAll(): void {
  const romAddresses = [...cache.keys()];
  cache.clear();
  romAddresses.forEach(loadConfig);
}
