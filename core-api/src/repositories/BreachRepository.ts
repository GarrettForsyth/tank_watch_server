/*******************************************************************************
 * Filename: BreachRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Repository for accessing sensor data.
 ******************************************************************************/
import { db } from '../db'
import { eq } from 'drizzle-orm'
import { sensors, devices, tanks, users, pushTokens } from '../db/schema'
import { BreachNotificationContext } from "../models/BreachNotificationContext"

export class BreachRepository {

  // Note: This query will return null if the relationships are not set up. 
  // It is expected that a sensor always belongs to a device which always 
  // belongs to a tank which always belongs to a user which has an
  // associated push token. Since Notifications require a push token,
  // the whole chain must remain intact to get it from a sensor.
  getNotificationContext(romAddress: string): BreachNotificationContext | null {
    const rows = db
    .select({
      sensorId: sensors.id,
      sensorDisplayName: sensors.displayName,
      tankName: tanks.name,
      pushToken: pushTokens.token,
    })
    .from(sensors)
    .innerJoin(devices, eq(sensors.deviceId, devices.id))
    .innerJoin(tanks, eq(devices.tankId, tanks.id))
    .innerJoin(users, eq(tanks.userId, users.id))
    .innerJoin(pushTokens, eq(users.id, pushTokens.userId))
    .where(eq(sensors.romAddress, romAddress))
    .all()

    const row = rows[0]

    if (!row) return null
      return row
  }
}


