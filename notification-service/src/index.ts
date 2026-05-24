/*******************************************************************************
 * Filename: index.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Handles notifications for tank watch.
 *
 * Watches redis for updates and pushes notifications to Firebase.
 ******************************************************************************/
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import { getSubscriber, getPublisher, CHANNELS } from '@tankwatch/shared-infra';
import { AlertTrigger, BreachType } from '@tankwatch/shared-events';

const COOLDOWN_SECONDS = 1800; // 30 minutes

function initFirebase(): void {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf-8')
  ) as ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function cooldownKey(sensorId: string, breach: BreachType): string {
  return `cooldown:${sensorId}:${breach}`;
}

async function isOnCooldown(sensorId: string, breach: BreachType): Promise<boolean> {
  const key = cooldownKey(sensorId, breach);
  const result = await getPublisher().get(key);
  return result !== null;
}

async function setCooldown(sensorId: string, breach: BreachType): Promise<void> {
  const key = cooldownKey(sensorId, breach);
  await getPublisher().set(key, '1', 'EX', COOLDOWN_SECONDS);
}

async function sendNotification(alert: AlertTrigger): Promise<void> {
  await admin.messaging().send({
    token: alert.pushToken,
    data: {
      type: 'notification_threshold_breach',
      sensorId: alert.sensorId,
      tankName: alert.tankName,
      sensorDisplayName: alert.sensorDisplayName,
      value: String(alert.value),
      measurementType: alert.measurementType,
      breach: alert.breach.toString(),
    },
  });
  console.log(`Notification sent for sensor ${alert.sensorId}: ${alert.breach}`);
}

async function handleAlert(message: string): Promise<void> {
  let alert: AlertTrigger;
  try {
    alert = JSON.parse(message) as AlertTrigger;
  } catch {
    console.warn('Failed to parse alert:trigger message:', message);
    return;
  }

  const onCooldown = await isOnCooldown(alert.sensorId, alert.breach);
  if (onCooldown) {
    console.log(`Suppressed notification for sensor ${alert.sensorId} — on cooldown`);
    return;
  }

  try {
    await sendNotification(alert);
    await setCooldown(alert.sensorId, alert.breach);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

async function main(): Promise<void> {
  initFirebase();

  const subscriber = getSubscriber();
  await subscriber.subscribe(CHANNELS.ALERT_TRIGGER);
  console.log('Notification service listening...');

  subscriber.on('message', (channel: string, message: string) => {
    if (channel !== CHANNELS.ALERT_TRIGGER) return;
    handleAlert(message);
  });
}

main();
