/*******************************************************************************
 * Filename: SensorConfig.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Senor's Configuration.
 *
 * The sensor configuation contains properties that dictates how it behaves.
 ******************************************************************************/
import type { InferSelectModel } from 'drizzle-orm'
import { sensorConfig } from '@tankwatch/shared/src/db/schema'
type SensorConfigRow = InferSelectModel<typeof sensorConfig>;

export class SensorConfig {
  constructor(
    public readonly id: number,
    public readonly updateIntervalSeconds: number,
    public readonly notificationsEnabled: boolean,
    public readonly minValue: number | null,
    public readonly maxValue: number | null
  ) {}

  static fromDrizzle(row: SensorConfigRow): SensorConfig {
    return new SensorConfig(
      row.id,
      row.updateIntervalSeconds,
      row.notificationsEnabled,
      row.minValue,
      row.maxValue
    )
  }
}
