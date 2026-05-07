/*******************************************************************************
 * Filename: Sensor.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Sensor.
 *
 * A Sensor is attached to Device and reports Readings.
 ******************************************************************************/
export class Sensor {
  constructor(
    public readonly id: number,
    public readonly deviceId: number,
    public readonly model: string,
    public readonly displayName: string | null
  ) {}
}
