/*******************************************************************************
 * Filename: index.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Creates and exports the interface to the SQLite database through Drizzle.
 ******************************************************************************/
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = process.env.SQLITE_DB_PATH
    ? path.resolve(process.env.SQLITE_DB_PATH)
    : path.resolve('./tankwatch.db');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
