/*******************************************************************************
 * Filename: BreachSubscriber.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 29th 2026
 * Description: Listens for breach events.
 *
 * When a breach event is published, grabs rich data,then requets for a FCM
 * push notification.
 ******************************************************************************/
import { BreachRepository } from "../repositories/BreachRepository"
import { getSubscriber, getPublisher, CHANNELS, SensorBreach, NotificationDispatch } from "@tankwatch/shared-infra"

export function startBreachSubscriber(BreachRepository: BreachRepository) {
  const subscriber = getSubscriber()
  const publisher = getPublisher()

  subscriber.subscribe(CHANNELS.SENSOR_BREACH, (err) => {
    if (err) throw new Error(`Failed to subscribe to ${CHANNELS.SENSOR_BREACH}`)
  })

  subscriber.on('message', async (_channel, message) => {
    const breach: SensorBreach = JSON.parse(message)
    const context = BreachRepository.getNotificationContext(breach.romAddress)
    if (!context) {
      console.log(`[BreachSubscriber] - failed to build (unable to chain relationship to get push token) notification context for: ${message}`)
      return  // sensor not fully configured — no tank, no token
    }

    const dispatch: NotificationDispatch = {
      type: 'sensor_breach',
      sensorId: String(context.sensorId),
      tankName: context.tankName,
      sensorDisplayName: context?.sensorDisplayName ?? "",
      value: breach.value,
      measurementType: breach.measurementType,
      breachType: breach.breachType,
      pushToken: context.pushToken,
    }
    await publisher.publish(CHANNELS.NOTIFICATION_DISPATCH, JSON.stringify(dispatch))
  })
}
