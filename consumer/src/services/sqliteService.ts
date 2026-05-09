/**
 * File: sqliteService.ts
 * Author: Garrett Forsyth
 * Date: May 9th 2026
 * Description: Handles auto-registration of devices and sensors in SQLite
 * when a new MQTT message arrives from an unknown device or sensor.
 *
 * On first message from a new device/sensor combination, this service
 * upserts the device and sensor rows so they appear in the system
 * without any manual intervention.
 */
import { db } from '@tankwatch/shared/src/db/index';
import { devices, sensors } from '@tankwatch/shared/src/db/schema';
import { eq } from 'drizzle-orm';

// Light cache to ease database access 
const sensorCache = new Set<string>();

export async function upsertDeviceAndSensor(
  macAddress: string,
  sensorModel: string,
  romAddress: string,
): Promise<void> {
  // Avoiding hitting the database if we can:
  if (sensorCache.has(romAddress)) return;

  // If the sensor is not cached, check if we've ever seen the device
  let device = db
  .select()
  .from(devices)
  .where(eq(devices.macAddress, macAddress))
  .get();

  // If not, insert it (deafult with no name and no tank assigned)
  if (!device) {
    device = db
      .insert(devices)
      .values({
        macAddress,
        name: null,
        tankId: null,
      })
      .returning()
      .get();

    if (!device) throw new Error(`Failed to insert device: ${macAddress}`);
    console.log(`Registered new device: ${macAddress} (id: ${device.id})`);
  }

  // Check if the reporting sensor has been seen before
  const existingSensor = db
  .select()
  .from(sensors)
  .where(eq(sensors.romAddress, romAddress))
  .get();

  // If not add it
  if (!existingSensor) {
    const sensor = db
    .insert(sensors)
    .values({
      deviceId: device.id,
      model: sensorModel,
      romAddress,
      displayName: null,
    })
    .returning()
    .get();

    if (!sensor) throw new Error(`Failed to insert sensor: ${romAddress}`);
    console.log(`Registered new sensor: ${romAddress} (id: ${sensor.id})`);
  }

  // Update the cache
  sensorCache.add(romAddress);
}
