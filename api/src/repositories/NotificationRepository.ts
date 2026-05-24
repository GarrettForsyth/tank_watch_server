/*******************************************************************************
 * Filename: NotificationRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Repository for accessing notification data.
 ******************************************************************************/
import { db } from '@tankwatch/shared-db/src/db/index'
import { pushTokens } from '@tankwatch/shared-db/src/db/schema'

export class NotificationRepository {

  upsertToken(token: string, userId: number){
    db.insert(pushTokens)
    .values({ userId, token })
    .onConflictDoUpdate({
      target: pushTokens.userId,
      set: { token }
    })
    .run();
  }
}
