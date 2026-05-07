/*******************************************************************************
 * Filename: Reading.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Reading produced by a Sensor.
 ******************************************************************************/
export class Reading {
  constructor(
    public readonly time: string,
    public readonly value: number,
    public readonly sensorId: number
  ) {}
}
