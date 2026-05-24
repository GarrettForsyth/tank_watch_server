/**
 * File: mqtt.ts 
 * Author: Garrett Forsyth
 * Date: May 3rd 2026
 * Description: This file handles publishing and subscrbing to the mqtt broker.
 *
 * When new readings are read, it writes them to the influx database. 
 *
 * We expect the readings to be published in form:
 *
 * tankwatch/{deviceId}/readings/{measurementType}/{sensorModel}/{romAddress}
 *
 * where:
 *   - deviceId is the MAC address of the device sending the data
 *   - measurementType is the type of sensor data (ex/ temperature)
 *   - sensorModel is the model of the device performing the readings
 *   - romAddress is the unique hardware id of the sensor
 *
 * Note: it is possible for devices to have multiple sensors of the 
 * same type. These can be distinguished by examing the payload
 */
import mqtt, { MqttClient } from 'mqtt';
import { writeReading } from './influxdb';
import { upsertDeviceAndSensor } from './sqliteService';
import { getConfig, loadConfig } from './configCache';
import { evaluate } from './AlertEvaluator';
import { getPublisher, CHANNELS } from '@tankwatch/shared-infra';
import { db } from '@tankwatch/shared-db/src/db/index';
import { sensors, devices, tanks, pushTokens } from '@tankwatch/shared-db/src/db/schema';
import { eq } from 'drizzle-orm';
import { AlertTrigger, BreachType } from '@tankwatch/shared-events';

const TOPIC = 'tankwatch/#';

// Capture groups for the deviceId, measurement type, and topic
// tankwatch/{deviceId}/readings/{measurementType}/{sensorModel}/{romAddress}
const TOPIC_REGEX = /^tankwatch\/([^/]+)\/readings\/([^/]+)\/([^/]+)\/([^/]+)$/;

function parseTopic(topic: string): { 
    deviceId: string;
    measurementType: string;
    sensorModel: string,
    romAddress: string
} | null {
    // Return null if we fail to match
    const match = topic.match(TOPIC_REGEX);
    if (!match) return null;
    
    // Destructured assignment (1st group matches the whole thing so skip it)
    const [, deviceId, measurementType, sensorModel, romAddress] = match;
    if (!deviceId || !measurementType || !sensorModel || !romAddress) return null;

    return { deviceId, measurementType, sensorModel, romAddress };
}

function parsePayload(payload: Buffer): number | null {
    try {
        // Convert bytes to a string (UTF-8) an parse the JSON
        const json = JSON.parse(payload.toString());
        
        // Could potentially use zod for safer type checking
        // but let's choose the simple way for now 
        if (typeof json.value !== 'number') return null;
        return json.value;
    } catch {
        return null;
    }
}

/**
  * This hits the database to get the informatino to pass to the 
  * notification service. It's a slow query but not expected to
  * hit often.
  */
async function buildAndPublishAlert(
  romAddress: string,
  value: number,
  measurementType: string,
  breach: BreachType
): Promise<void> {
  const row = db
    .select({
      sensorId:          sensors.id,
      sensorDisplayName: sensors.displayName,
      tankName:          tanks.name,
      pushToken:         pushTokens.token,
    })
    .from(sensors)
    .innerJoin(devices, eq(devices.id, sensors.deviceId))
    .innerJoin(tanks, eq(tanks.id, devices.tankId))
    .innerJoin(pushTokens, eq(pushTokens.userId, tanks.userId))
    .where(eq(sensors.romAddress, romAddress))
    .get();

  if (!row) {
    console.warn(`Alert triggered for ${romAddress} but couldn't resolve sensor/tank info — skipping`);
    return;
  }

  const alert: AlertTrigger = {
    sensorId:          String(row.sensorId),
    tankName:          row.tankName,
    sensorDisplayName: row.sensorDisplayName ?? 'Unknown Sensor',
    value,
    measurementType,
    breach,
    pushToken:        row.pushToken
  };

  await getPublisher().publish(CHANNELS.ALERT_TRIGGER, JSON.stringify(alert));
  console.log(`Alert published for sensor ${romAddress}: ${breach}`);
}

/**
  * Checks the reading against the sensor's configured threshold. 
  * If outside - gathers data and passes to the notification service.
  */
async function evaluateAndAlert(
  romAddress: string,
  value: number,
  measurementType: string
): Promise<void> {
  let config = getConfig(romAddress);
  if (!config) {
    loadConfig(romAddress);
    config = getConfig(romAddress);
  }

  if (!config) return;
  if (!config.notificationsEnabled) return;
  if (config.minValue === null || config.maxValue === null) return;

  const breach = evaluate(value, { minValue: config.minValue, maxValue: config.maxValue });
  if (!breach) return;

  await buildAndPublishAlert(romAddress, value, measurementType, breach);
}

export function startMqttConsumer(): MqttClient {
    const client = mqtt.connect(process.env.MQTT_BROKER_URL!, {
        username: process.env.MQTT_USERNAME!,
        password: process.env.MQTT_PASSWORD!,
    });

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe(TOPIC, (err) => {
            if (err) console.error('Failed to subscribe:', err);
            else console.log(`Subscribed to ${TOPIC}`);
        });
    });

    client.on('message', async (topic, payload) => {
        const parsed = parseTopic(topic);
        if (!parsed) {
            console.warn(`Unrecognised topic: ${topic}`);
            return;
        }

        const value = parsePayload(payload);
        if (value === null) {
            console.warn(`Invalid payload on topic ${topic}: ${payload.toString()}`);
            return;
        }

        console.log(`[${parsed.deviceId}] ${parsed.measurementType}/${parsed.sensorModel}/${parsed.romAddress}: ${value}`);
        // Record the reading in the real time database
        writeReading(value, parsed.deviceId, parsed.measurementType, parsed.sensorModel, parsed.romAddress);
        // Update the SQL database if it's the first time seeing the device or sensor
        upsertDeviceAndSensor(parsed.deviceId, parsed.sensorModel, parsed.romAddress); 

        await evaluateAndAlert(
          parsed.romAddress,
          value,
          parsed.measurementType
        );
    });

    // Just log these events to help with debugging
    client.on('error', (err) => {
        console.error('MQTT error:', err);
    });

    client.on('disconnect', () => {
        console.warn('Disconnected from MQTT broker');
    });

    client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
    });

    return client;
}
