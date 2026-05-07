/*******************************************************************************
 * Filename: Device.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Model for a device.
 *
 * A device is the board/microcontroller the sensors are attached to
 ******************************************************************************/
export class Device {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly tankId: number | null,
    public readonly name: string,
    public readonly macAddress: string
  ) {}
}
