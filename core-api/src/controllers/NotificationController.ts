/*******************************************************************************
 * Filename: NotificationController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Controller for notifications.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { NotificationRepository } from '../repositories/NotificationRepository'
import { z } from 'zod'

export const UpsertPushTokenBody = z.object({
  token: z.string().min(1)
})

export class NotificationController {

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async upsertToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Parse user_id from auth and filter by that
      const tempUserId = 1;
      const body = UpsertPushTokenBody.parse(req.body);
      this.notificationRepository.upsertToken(body.token, tempUserId);
      res.status(204).send();
    } catch (error) {
      next(error)
    }
  }
}
