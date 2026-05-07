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
export class Reading {
  constructor(
    public readonly time: string,
    public readonly value: number,
    public readonly deviceId: string,
    public readonly sensorModel: string
  ) {}
}
