/**
 * File: index.ts 
 * Author: Garrett Forsyth
 * Date: May 24th 2026
 * Description: This file exports shared types for events b/w projects.
 *
 * While there are few, everythign is jammed in here, but
 * as more events are added, they should be refactored.
 */

/* The 'reason' a reading is breached */
export enum BreachType {
  Min = 'min',
  Max = 'max'
}

/* Payload to send to the notification service when there is a breach */
export type AlertTrigger = {
  sensorId: string
  tankName: string
  sensorDisplayName: string
  value: number
  measurementType: string
  breach: BreachType,
  pushToken: string
}

/* Event notifiying the sensor's config is updated (Consumer should re-read) */
export type ConfigUpdated = {
  romAddress: string
}
