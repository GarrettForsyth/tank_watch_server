/*******************************************************************************
 * Filename: DeviceController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Controller for Devices.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { DeviceRepository } from '../repositories/DeviceRepository'
import { z } from 'zod'

const GetSensorParams = z.object({
  deviceId: z.coerce.number().int().positive()
})

export class DeviceController {

  constructor(private readonly deviceRepository: DeviceRepository) {}

  async getSensors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = GetSensorParams.parse(req.params)
      const sensors = this.deviceRepository.getSensorsByDeviceId(params.deviceId);
      res.json(sensors);
    } catch (error) {
      next(error)
    }
  }
}
