/*******************************************************************************
 * Filename: BreachNotificationContext.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 28th 2026
 * Description: Data required to create a Breach Notification.
 ******************************************************************************/
export class BreachNotificationContext {
  constructor(
    public readonly sensorId: number,
    public readonly sensorDisplayName: string | null,
    public readonly tankName: string,
    public readonly pushToken: string
  ) {}
}
