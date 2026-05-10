/*******************************************************************************
 * Filename: SensorController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Controller for Sensor.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { SensorRepository } from '../repositories/SensorRepository'
import { z } from 'zod'

const GetSensorParams = z.object({
  sensorId: z.coerce.number().int().positive()
})

export class SensorController {

  constructor(private readonly sensorRepository: SensorRepository) {}

  async getConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Parse user_id from auth and filter by that
      const tempUserId = 1;
      const params = GetSensorParams.parse(req.params)
      const config = this.sensorRepository.getConfiguration(params.sensorId, tempUserId);
      if (config) {
        res.json(config);
      } else {
        res.status(404).json({ message: 'Sensor configuration not found' });
      }
    } catch (error) {
      next(error)
    }
  }
}
