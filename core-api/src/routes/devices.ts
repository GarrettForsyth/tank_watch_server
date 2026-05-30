/*******************************************************************************
 * Filename: devices.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Endpoints for the device resource.
 ******************************************************************************/
import { Router } from 'express'
import { DeviceRepository } from '../repositories/DeviceRepository'
import { DeviceController } from '../controllers/DeviceController'

export function createDevicesRouter(deviceRepository: DeviceRepository) {
    const router = Router();
    const controller = new DeviceController(deviceRepository);

    // Get all devices
    router.get('/', (req, res, next) =>
        controller.getAll(req, res, next)
    );

    // Get all sensors for a device
    router.get('/:deviceId/sensors', (req, res, next) =>
        controller.getSensors(req, res, next)
    );

    return router;
}
