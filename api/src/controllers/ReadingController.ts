/*******************************************************************************
 * Filename: ReadingController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Controller for Readings.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ReadingRepository } from '../repositories/ReadingRepository'
import { SensorRepository } from '../repositories/SensorRepository'
import { DeviceRepository } from '../repositories/DeviceRepository'

// TODO: Might want to revisit the allowed ranges here
const GetQuerySchema = z.object({
  deviceId: z.coerce.number().min(1),
  sensorId: z.coerce.number().min(1),
  range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h')
})

export class ReadingController {

  constructor(
    private readonly readingRepository: ReadingRepository,
    private readonly sensorRepository: SensorRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async getLastReadings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = GetQuerySchema.parse(req.query);

      // Get the device info from the id
      const device = this.deviceRepository.getDevice(query.deviceId);
      if (!device) {
        res.status(404).json({ message: 'No device found' });
        return;
      }

      // Get the sensor info from the id
      const sensor = this.sensorRepository.getSensor(query.sensorId);
      if (!sensor) {
        res.status(404).json({ message: 'No sensor found' });
        return;
      }

      const readings = await this.readingRepository.getLastReadings(
        device.macAddress,
        sensor.romAddress,
        query.range
      );
      res.json(readings);
    } catch (error) {
      next(error); // Error handler will format zod errors
    }
  }
}


