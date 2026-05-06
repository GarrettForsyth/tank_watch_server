/*******************************************************************************
 * Filename: drizzle.config.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Configuration for the Drizzle ORM
 ******************************************************************************/
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH ?? './tankwatch.db',
  },
});
