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
import { SensorConfigUpdated } from '@tankwatch/shared-infra/src/events';

export type CachedSensorConfig = {
  notificationsEnabled: boolean
  minValue: number | null
  maxValue: number | null
}

const cache = new Map<string, CachedSensorConfig>()
const CORE_API_URL = process.env.CORE_SERVICE ?? ""

// Called on every reading — hits cache first, falls back to HTTP (rarely expect to hit HTTP after start)
export async function getConfig(romAddress: string): Promise<CachedSensorConfig | null> {
  const cached = cache.get(romAddress)

  if (cached) return cached

  try {
    const res = await fetch(`${CORE_API_URL}/internal/sensors/config?romAddress=${romAddress}`)
    if (res.status === 404) {
      console.warn(`[configCache] config not found for ${romAddress}`)
      return null
    } 
    if (!res.ok) throw new Error(`Config fetch failed for ${romAddress}: ${res.status}`)

    const config: CachedSensorConfig = await res.json()
    cache.set(romAddress, config)
    return config
  } catch (err) {
    console.warn(`[configCache] core-api unreachable, skipping evaluation for ${romAddress}:`, err)
    return null
  }
}

// Called when sensor:config-updated arrives — fat event, no HTTP needed
export function updateConfig(event: SensorConfigUpdated): void {
  cache.set(event.romAddress, {
    notificationsEnabled: event.notificationsEnabled,
    minValue: event.minValue,
    maxValue: event.maxValue,
  })
}

export function invalidateConfig(romAddress: string): void {
  cache.delete(romAddress);
  getConfig(romAddress);
}

export function invalidateAll(): void {
  const romAddresses = [...cache.keys()];
  cache.clear();
  romAddresses.forEach(getConfig);
}
