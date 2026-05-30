/*******************************************************************************
 * Filename: events/index.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 24th 2026
 * Description: Event types published to Redis
 ******************************************************************************/

export enum BreachType {
  Min = 'min',
  Max = 'max'
}

/* When reading value is detcted outside the sensor config's threshold */
  export type SensorBreach = {
  romAddress: string
  measurementType: string
  value: number
  breachType: BreachType
}

/* When the sensor config is updated  */
  export type SensorConfigUpdated = {
  romAddress: string
  notificationsEnabled: boolean
  minValue: number | null
  maxValue: number | null
}

/* When a notification for a sensor breach is requested */
export type SensorBreachDispatch = {
  type: 'sensor_breach'
  sensorId: string
  tankName: string
  sensorDisplayName: string
  value: number
  measurementType: string
  breachType: BreachType
  pushToken: string
}

/* Discriminated union to support different notification types */
export type NotificationDispatch = SensorBreachDispatch // | DeviceOfflineDispatch | ...

