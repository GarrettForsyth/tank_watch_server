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

const SensorConfigSchema = z.object({
  updateIntervalSeconds: z.number().int().positive().min(10),
  notificationsEnabled: z.boolean(),
  minValue: z.number().int().nullable(),
  maxValue: z.number().int().nullable()
}).refine(
  data => data.minValue === null || data.maxValue === null || data.minValue < data.maxValue,
  { message: 'minValue must be less than maxValue' }
)

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

  async upsertConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Parse user_id from auth and filter by that
      // TODO: Check if sensor belongs to user and return unauth if not
      const tempUserId = 1;
      const params = GetSensorParams.parse(req.params);
      const accessible = this.sensorBelongsToUser(params.sensorId, tempUserId);
      if (!accessible) {
        res.status(404).json({ message: 'Sensor not found' });
        return;
      }

      const body = SensorConfigSchema.parse(req.body);
      const config = this.sensorRepository.upsertConfiguration(
        params.sensorId,
        body.updateIntervalSeconds,
        body.notificationsEnabled,
        body.minValue,
        body.maxValue
      );
      if (config) {
        res.json(config);
      } else {
        res.status(500).json({ message: 'Failed to modify sensor configuration.' });
      }
    } catch (error) {
      next(error)
    }
  }

  private sensorBelongsToUser(sensorId: number, userId: number): boolean {
    let owner = this.sensorRepository.getSensorOwner(sensorId);
    return owner ? owner.id === userId : false;
  }
}
