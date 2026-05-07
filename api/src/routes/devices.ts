/*******************************************************************************
 * Filename: devies.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Endpoints for the device route.
 ******************************************************************************/
import { Router } from 'express'
import { DeviceRepository } from '../repositories/DeviceRepository'
import { DeviceController } from '../controllers/DeviceController'

export function createDevicesRouter(deviceRepository: DeviceRepository) {
    const router = Router();
    const controller = new DeviceController(deviceRepository);

    router.get('/:deviceId/sensors', (req, res, next) =>
        controller.getSensors(req, res, next)
    );

    return router;
}
