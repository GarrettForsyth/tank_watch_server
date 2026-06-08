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

export const GetDeviceSensorsParams = z.object({
  deviceId: z.coerce.number().int().positive()
})

export class DeviceController {

  constructor(private readonly deviceRepository: DeviceRepository) {}

  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Parse user_id from auth and filter by that
      const tempUserId = 1;
      const devices = this.deviceRepository.getAll(tempUserId);
      res.json(devices);
    } catch (error) {
      next(error)
    }
  }

  async getSensors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = GetDeviceSensorsParams.parse(req.params)
      const sensors = this.deviceRepository.getSensorsByDeviceId(params.deviceId);
      res.json(sensors);
    } catch (error) {
      next(error)
    }
  }
}
