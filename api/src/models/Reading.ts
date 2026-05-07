/*******************************************************************************
 * Filename: Reading.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Reading produced by a Sensor.
 *
 * Note: this is read from the Influx DB - not SQL. At the moment, the firmware
 * publishes based on the device id + model. Once we add configuration upadtes,
 * we can add another field to support multiple sensors of the same model.
 ******************************************************************************/
import { MeasurementType } from "./MeasurementType";

export class Reading {
  constructor(
    public readonly time: string,
    public readonly measurementType: MeasurementType,
    public readonly value: number,
    public readonly macAddress: string,
    public readonly sensorModel: string,
  ) {}

  static fromInflux(record: Record<string, unknown>): Reading {
    return new Reading(
      record._time as string,
      record._measurement as MeasurementType,
      record._value as number,
      record.device_id as string, // Device id is mac address published by device here
      record.sensor_model as string
    )
  }
}
