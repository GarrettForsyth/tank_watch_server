/*******************************************************************************
 * Filename: DeviceRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Repository for accessing device data.
 ******************************************************************************/
import { db } from '../db'
import { devices, sensors, tanks } from '../db/schema'
import { eq } from 'drizzle-orm'
import { Device } from '../models/Device'
import { Sensor } from '../models/Sensor'

export class DeviceRepository {

  getDevice(deviceId: number) : Device | null {
    const device = db
      .select()
      .from(devices)
      .where(eq(devices.id, deviceId))
      .get()
    return  device ? Device.fromDrizzle(device) : null;
  }

  getDeviceByMac(macAddress: string): Device | null {
    const result = db
      .select()
      .from(devices)
      .where(eq(devices.macAddress, macAddress))
      .get();
    return result ? Device.fromDrizzle(result) : null;
  }

  getAll(userId: number): Device[] {
    let result = db
      .select()
      .from(devices)
      .innerJoin(tanks, eq(devices.tankId, tanks.id))
      .where(eq(tanks.userId, userId))
      .all()

    return result.map(r => Device.fromDrizzle(r.devices));
  }

  getSensorsByDeviceId(deviceId: number): Sensor[] {
    return db
      .select()
      .from(sensors)
      .where(eq(sensors.deviceId, deviceId))
      .all()
      .map(row => Sensor.fromDrizzle(row));
  }
}
