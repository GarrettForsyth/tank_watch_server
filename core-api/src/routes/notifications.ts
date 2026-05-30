/*******************************************************************************
 * Filename: notifications.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Endpoints for the notifications resource.
 ******************************************************************************/
import { Router } from 'express'
import { NotificationController } from '../controllers/NotificationController'
import { NotificationRepository } from '../repositories/NotificationRepository'

export function createNotificationsRouter(notificationRepository: NotificationRepository) {
    const router = Router();
    const controller = new NotificationController(notificationRepository);

    // Add or update a user's notification token
    router.put('/token', (req, res, next) =>
        controller.upsertToken(req, res, next)
    );

    return router;
}

