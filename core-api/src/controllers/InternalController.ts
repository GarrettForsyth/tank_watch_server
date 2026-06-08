/*******************************************************************************
 * Filename: InternalController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Controller for Internal services.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { SensorRepository } from '../repositories/SensorRepository'
import { z } from 'zod'

export const GetConfigByRomAddressQuery = z.object({
  romAddress: z.coerce.string().min(1),
})

export class InternalController {

  constructor(private readonly sensorRepository: SensorRepository) {}

  async getConfigurationByRomAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // TODO: Auth internal services using secret keys
    try {
      const romAddress = GetConfigByRomAddressQuery.parse(req.query)?.romAddress
      const config = this.sensorRepository.getConfigurationByRomAddress(romAddress);
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
