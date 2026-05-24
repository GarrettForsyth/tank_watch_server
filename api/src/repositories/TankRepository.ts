/*******************************************************************************
 * Filename: TankRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 23rd 2026
 * Description: Repository for accessing tank data.
 ******************************************************************************/
import { db } from '@tankwatch/shared-db/src/db/index'
import { tanks} from '@tankwatch/shared-db/src/db/schema'
import { eq } from 'drizzle-orm'
import { Tank } from '../models/Tank'

export class TankRepository {

  getTank(tankId: number) : Tank | null {
    const tank = db
      .select()
      .from(tanks)
      .where(eq(tanks.id, tankId))
      .get()
    return  tank ? Tank.fromDrizzle(tank) : null;
  }
}

