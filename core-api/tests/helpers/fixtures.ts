import { db } from './testDb'
import { users, tanks, devices, sensors } from '../../src/db/schema'

export type BaseFixture = {
  userId: number
  tankId: number
  deviceId: number
  sensorId: number
  romAddress: string
  macAddress: string
}

export function seedBaseFixture(): BaseFixture {
  const user   = db.insert(users).values({ externalId: 'test-user' }).returning().get()!
  const tank   = db.insert(tanks).values({ userId: user.id, name: 'Test Tank' }).returning().get()!
  const device = db.insert(devices).values({ tankId: tank.id, macAddress: '00:11:22:33:44:55' }).returning().get()!
  const sensor = db.insert(sensors).values({
    deviceId: device.id,
    model: 'DS18B20',
    romAddress: '28-test-rom-addr',
  }).returning().get()!

  return {
    userId: user.id,
    tankId: tank.id,
    deviceId: device.id,
    sensorId: sensor.id,
    romAddress: '28-test-rom-addr',
    macAddress: '00:11:22:33:44:55',
  }
}
