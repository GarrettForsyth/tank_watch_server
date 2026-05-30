/*******************************************************************************
 * Filename: sensors.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description:
 *
 * Endpoints for the sensor resource.
 ******************************************************************************/
import { Router } from 'express'
import { SensorRepository } from '../repositories/SensorRepository'
import { SensorController } from '../controllers/SensorController'
import { DeviceRepository } from '../repositories/DeviceRepository';
import { TankRepository } from '../repositories/TankRepository';

export function createSensorsRouter(
  sensorRepository: SensorRepository,
  deviceRepository: DeviceRepository,
  tankRepository: TankRepository
) {
    const router = Router();
    const controller = new SensorController(sensorRepository, deviceRepository, tankRepository);

    // Get sensor
    router.get('/:sensorId', (req, res, next) =>
        controller.getSensor(req, res, next)
    );

    // Get sensor configuration
    router.get('/:sensorId/config', (req, res, next) =>
        controller.getConfiguration(req, res, next)
    );

    // Upsert sensor configuration
    router.put('/:sensorId/config', (req, res, next) =>
        controller.upsertConfiguration(req, res, next)
    );

    return router;
}

