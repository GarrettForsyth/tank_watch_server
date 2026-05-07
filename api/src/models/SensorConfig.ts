/*******************************************************************************
 * Filename: SensorConfig.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a Senor's Configuration.
 *
 * The sensor configuation contains properties that dictates how it behaves.
 ******************************************************************************/
export class SensorConfig {
  constructor(
    public readonly id: number,
    public readonly updateIntervalSeconds: number,
    public readonly notificationsEnabled: boolean,
    public readonly minValue: number | null,
    public readonly maxValue: number | null
  ) {}
}
