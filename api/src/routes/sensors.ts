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

export function createSensorsRouter(sensorRepository: SensorRepository) {
    const router = Router();
    const controller = new SensorController(sensorRepository);

    // Get sensor configuration
    router.get('/:sensorId/config', (req, res, next) =>
        controller.getConfiguration(req, res, next)
    );

    return router;
}

