"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*******************************************************************************
 * Filename: drizzle.config.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Configuration for the Drizzle ORM
 ******************************************************************************/
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.SQLITE_DB_PATH ?? '../tankwatch.db',
    },
});
//# sourceMappingURL=drizzle.config.js.map