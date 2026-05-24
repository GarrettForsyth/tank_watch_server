/*******************************************************************************
 * Filename: Tank.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a tank.
 *
 * A device is the tank that devices are monitoring.
 ******************************************************************************/
import type { InferSelectModel } from 'drizzle-orm'
import { tanks } from '@tankwatch/shared-db/src/db/schema'
type TankRow = InferSelectModel<typeof tanks>;

export class Tank {
  constructor(
    public readonly id: number,
    public readonly userId: number | null,
    public readonly name: string | null,
    public readonly description: string | null,
  ) {}

  static fromDrizzle(row: TankRow): Tank {
    return new Tank(
      row.id,
      row.userId,
      row.name,
      row.description
    )
  }
}
