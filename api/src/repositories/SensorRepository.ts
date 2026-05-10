/*******************************************************************************
 * Filename: SensorRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Repository for accessing sensor data.
 ******************************************************************************/
import { db } from '@tankwatch/shared/src/db/index'
import { devices, sensors, tanks, sensorConfig } from '@tankwatch/shared/src/db/schema'
import { eq, and } from 'drizzle-orm'
import { SensorConfig } from '../models/SensorConfig'

export class SensorRepository {

  getConfiguration(sensorId: number, userId: number): SensorConfig | null {
    let result = db
      .select()
      .from(sensorConfig)
      .innerJoin(sensors, eq(sensorConfig.sensorId, sensors.id))
      .innerJoin(devices, eq(sensors.deviceId, devices.id))
      .innerJoin(tanks, eq(devices.tankId, tanks.id))
      .where(and(
        eq(tanks.userId, userId),
        eq(sensors.id, sensorId)
      ))
      .get();
    return result ? SensorConfig.fromDrizzle(result.sensor_config) : null;
  }

  getAll(userId: number): SensorConfig[] {
    let result = db
      .select()
      .from(sensorConfig)
      .innerJoin(sensors, eq(sensorConfig.sensorId, sensors.id))
      .innerJoin(devices, eq(sensors.deviceId, devices.id))
      .innerJoin(tanks, eq(devices.tankId, tanks.id))
      .where(eq(tanks.userId, userId))
      .all();
    return result.map(r => SensorConfig.fromDrizzle(r.sensor_config));
  }
}
