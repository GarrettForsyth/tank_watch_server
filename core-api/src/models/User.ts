/*******************************************************************************
 * Filename: User.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Model for a user.
 ******************************************************************************/
import type { InferSelectModel } from 'drizzle-orm'
import { users } from '../db/schema'
type UserRow = InferSelectModel<typeof users>;

export class User {
  constructor(
    public readonly id: number,
    public readonly externalId: string | null
  ) {}

  static fromDrizzle(row: UserRow): User {
    return new User(
      row.id,
      row.externalId
    )
  }
}
