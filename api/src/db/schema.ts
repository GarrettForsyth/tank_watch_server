/*******************************************************************************
 * Filename: schema.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Initial table setup for the SQLite DB.
 *
 * To avoid data loss, this file should be run on initial project setup.
 * Alterations should be added via migrations (see src/db/migrate.ts).
 *
 * This file will create tables for:
 *  - users
 *  - tanks
 *  - devices
 *  - sensors
 *  - sensor configurations
 *  - push notification tokens
 *
 * Note: The user tables in the SQLite database only store domain specific
 * data about the user (e.g. user relationships with other entities). For 
 * auth related data, use the user's Clerk object.
 ******************************************************************************/
import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
    id:         integer('id').primaryKey({ autoIncrement: true }),
    externalId: text('external_id').unique(),
    createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const tanks = sqliteTable('tanks', {
    id:          integer('id').primaryKey({ autoIncrement: true }),
    userId:      integer('user_id').notNull().references(() => users.id),
    name:        text('name').notNull(),
    description: text('description'),
    createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const devices = sqliteTable('devices', {
    id:              integer('id').primaryKey({ autoIncrement: true }),
    tankId:          integer('tank_id').references(() => tanks.id),
    macAddress:      text('mac_address').notNull().unique(),
    name:            text('name'),
    firmwareVersion: text('firmware_version'),
    createdAt:       text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const sensors = sqliteTable('sensors', {
    id:          integer('id').primaryKey({ autoIncrement: true }),
    deviceId:    integer('device_id').notNull().references(() => devices.id),
    model:       text('model').notNull(),
    displayName: text('display_name'),
    createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const sensorConfig = sqliteTable('sensor_config', {
    id:                    integer('id').primaryKey({ autoIncrement: true }),
    sensorId:              integer('sensor_id').notNull().unique().references(() => sensors.id),
    updateIntervalSeconds: integer('update_interval_seconds').notNull().default(30),
    notificationsEnabled:  integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
    minValue:              real('min_value'),
    maxValue:              real('max_value'),
    createdAt:             text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt:             text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const pushTokens = sqliteTable('push_tokens', {
    id:        integer('id').primaryKey({ autoIncrement: true }),
    userId:    integer('user_id').notNull().references(() => users.id),
    token:     text('token').notNull(),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
