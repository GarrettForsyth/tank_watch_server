/*******************************************************************************
 * Filename: SensorRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Repository for accessing sensor data.
 ******************************************************************************/
import { db } from '@tankwatch/shared/src/db/index'
import { devices, sensors, tanks, sensorConfig, users } from '@tankwatch/shared/src/db/schema'
import { eq, and } from 'drizzle-orm'
import { SensorConfig } from '../models/SensorConfig'
import { User } from '../models/User'
import { Sensor } from '../models/Sensor'

export class SensorRepository {

  getSensor(sensorId: number) : Sensor | null {
    const sensor = db
      .select()
      .from(sensors)
      .where(eq(sensors.id, sensorId))
      .get()
    return sensor ? Sensor.fromDrizzle(sensor) : null;
  }

  getSensorOwner(sensorId: number): User | null {
    let owner = db
      .select()
      .from(sensors)
      .innerJoin(devices, eq(sensors.deviceId, devices.id))
      .innerJoin(tanks, eq(devices.tankId, tanks.id))
      .innerJoin(users, eq(tanks.userId, users.id))
      .where(eq(sensors.id, sensorId))
      .get();
    return owner ? User.fromDrizzle(owner.users) : null;
  }

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

  upsertConfiguration(
    sensorId: number,
    updateIntervalSeconds: number,
    notificationsEnabled: boolean,
    minValue: number | null,
    maxValue: number | null
  ): SensorConfig | null {
    let result = db.insert(sensorConfig)
    .values({
      sensorId: sensorId,
      updateIntervalSeconds: updateIntervalSeconds,
      notificationsEnabled: notificationsEnabled,
      minValue: minValue,
      maxValue: maxValue,
    })
    .onConflictDoUpdate({
      target: sensorConfig.sensorId,
      set: {
        updateIntervalSeconds: updateIntervalSeconds,
        notificationsEnabled: notificationsEnabled,
        minValue: minValue,
        maxValue: maxValue,
        updatedAt: new Date().toISOString(),
      }
    })
    .returning()
    .get();
    return result ? SensorConfig.fromDrizzle(result) : null;
  }
}
