/*******************************************************************************
 * Filename: Device.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a device.
 *
 * A device is the board/microcontroller the sensors are attached to
 ******************************************************************************/
import type { InferSelectModel } from 'drizzle-orm'
import { devices } from '@tankwatch/shared-db/src/db/schema'
type DeviceRow = InferSelectModel<typeof devices>;

export class Device {
  constructor(
    public readonly id: number,
    public readonly tankId: number | null,
    public readonly name: string | null,
    public readonly macAddress: string
  ) {}

  static fromDrizzle(row: DeviceRow): Device {
    return new Device(
      row.id,
      row.tankId,
      row.name,
      row.macAddress
    )
  }
}
