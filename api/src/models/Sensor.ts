/*******************************************************************************
 * Filename: Sensor.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Sensor.
 *
 * A Sensor is attached to Device and reports Readings.
 ******************************************************************************/
import type { InferSelectModel } from 'drizzle-orm'
import { sensors } from '@tankwatch/shared/src/db/schema'
type SensorRow = InferSelectModel<typeof sensors>;

export class Sensor {
  constructor(
    public readonly id: number,
    public readonly deviceId: number,
    public readonly model: string,
    public readonly romAddress: string,
    public readonly displayName: string | null
  ) {}

  static fromDrizzle(row: SensorRow): Sensor {
    return new Sensor(
      row.id,
      row.deviceId,
      row.model,
      row.romAddress,
      row.displayName
    )
  }
}
