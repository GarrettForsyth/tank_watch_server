/*******************************************************************************
 * Filename: SensorController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 10th 2026
 * Description: Controller for Sensor.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { SensorRepository } from '../repositories/SensorRepository'
import { DeviceRepository } from '../repositories/DeviceRepository'
import { TankRepository } from '../repositories/TankRepository'
import { z } from 'zod'
import { getPublisher, SensorConfigUpdated, CHANNELS } from '@tankwatch/shared-infra';

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

  constructor(
    private readonly sensorRepository: SensorRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly tankRepository: TankRepository,
  ) {}

  async getSensor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = GetSensorParams.parse(req.params)
      const sensor = this.sensorRepository.getSensor(params.sensorId);
      if (!sensor) {
        res.status(404).json({ error: 'Sensor not found' })
        return
      }

      const device = this.deviceRepository.getDevice(sensor?.deviceId)
      const tank = device?.tankId ? this.tankRepository.getTank(device.tankId) : null

      res.json({
        ...sensor,
        deviceName: device?.name ?? device?.macAddress,
        tankName: tank?.name ?? '?'
      });
    } catch (error) {
      next(error)
    }
  }

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
      if (!config) {
        res.status(500).json({ message: 'Failed to modify sensor configuration.' });
        return
      }

      // Publish config:update event so consumer can invalidate its cache
      const sensor = this.sensorRepository.getSensor(params.sensorId);
      if (sensor) {
        const payload: SensorConfigUpdated = {
          romAddress: sensor.romAddress,
          notificationsEnabled: config.notificationsEnabled,
          minValue: config.minValue,
          maxValue: config.maxValue,
        }
        await getPublisher().publish(CHANNELS.SENSOR_CONFIG_UPDATED, JSON.stringify(payload))
      } else {
        console.warn(`Skipped SENSOR_CONFIG_UPDATED event: could not find sensor with id ${params.sensorId}`)
      }

      res.json(config)
    } catch (error) {
      next(error)
    }
  }

  private sensorBelongsToUser(sensorId: number, userId: number): boolean {
    let owner = this.sensorRepository.getSensorOwner(sensorId);
    return owner ? owner.id === userId : false;
  }
}
