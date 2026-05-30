/*******************************************************************************
 * Filename: internal.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Endpoints for internal service use only.
 ******************************************************************************/
import { Router } from 'express'
import { SensorRepository } from '../repositories/SensorRepository'
import { InternalController } from '../controllers/InternalController'

export function createInternalRouter(
  sensorRepository: SensorRepository,
) {
    const router = Router();
    const controller = new InternalController(sensorRepository);

    // Get sensor configuration
    console.log("Handling sensor config..")
    router.get('/sensors/config', (req, res, next) =>
        controller.getConfigurationByRomAddress(req, res, next)
    );

    return router;
}

