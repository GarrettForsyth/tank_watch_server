/*******************************************************************************
 * Filename: seed.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Seed the database with initial data to aid in testing
 ******************************************************************************/
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { db } from './index';
import { users, tanks, devices, sensors, sensorConfig } from './schema';

function requireFirst<T>(rows: T[], label: string): T {
    const row = rows[0];
    if (!row) throw new Error(`Seed failed: no row returned for ${label}`);
    return row;
}

async function seed() {
    console.log('Seeding database...');

    const user = requireFirst(
        db.insert(users).values({
            externalId: null,
        }).returning().all(),
        'user'
    );
    console.log(`Created user: ${user.id}`);

    const tank = requireFirst(
        db.insert(tanks).values({
            userId: user.id,
            name: 'Main Tank',
            description: "Garrett's freshwater aquarium",
        }).returning().all(),
        'tank'
    );
    console.log(`Created tank: ${tank.id}`);

    const device = requireFirst(
        db.insert(devices).values({
            tankId: tank.id,
            macAddress: '6825DDF0A9C0',
            name: 'ESP32 Main Tank',
        }).returning().all(),
        'device'
    );
    console.log(`Created device: ${device.id}`);

    const sensor = requireFirst(
        db.insert(sensors).values({
            deviceId: device.id,
            model: 'DS18B20',
            displayName: 'Water Temperature',
        }).returning().all(),
        'sensor'
    );
    console.log(`Created sensor: ${sensor.id}`);

    db.insert(sensorConfig).values({
        sensorId: sensor.id,
        updateIntervalSeconds: 30,
        notificationsEnabled: true,
        minValue: 22.0,
        maxValue: 28.0,
    }).run();
    console.log(`Created sensorConfig for sensor: ${sensor.id}`);

    console.log('Done.');
}

seed().catch(console.error);
