/*******************************************************************************
 * Filename: migrate.ts
 * Project: Tank Watch (Server)
 * Description: Applies pending SQLite migrations.
 *
 * Uses drizzle-orm's runtime migrator (rather than drizzle-kit, a dev-only
 * tool) so migrations can run in the production container on startup. It
 * reads the same migration files and journal that drizzle-kit generates, and
 * is a no-op when the database is already up to date.
 ******************************************************************************/
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import path from 'path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

const migrationsFolder = process.env.MIGRATIONS_DIR
    ? path.resolve(process.env.MIGRATIONS_DIR)
    : path.join(__dirname, 'migrations');

migrate(db, { migrationsFolder });
console.log(`Migrations applied from ${migrationsFolder}`);
