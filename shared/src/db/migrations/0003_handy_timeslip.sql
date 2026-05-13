PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tank_id` integer,
	`mac_address` text NOT NULL,
	`name` text,
	`firmware_version` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_devices`("id", "tank_id", "mac_address", "name", "firmware_version", "created_at") SELECT "id", "tank_id", "mac_address", "name", "firmware_version", "created_at" FROM `devices`;--> statement-breakpoint
DROP TABLE `devices`;--> statement-breakpoint
ALTER TABLE `__new_devices` RENAME TO `devices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `devices_mac_address_unique` ON `devices` (`mac_address`);--> statement-breakpoint
CREATE TABLE `__new_push_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_push_tokens`("id", "user_id", "token", "created_at", "updated_at") SELECT "id", "user_id", "token", "created_at", "updated_at" FROM `push_tokens`;--> statement-breakpoint
DROP TABLE `push_tokens`;--> statement-breakpoint
ALTER TABLE `__new_push_tokens` RENAME TO `push_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `push_tokens_user_id_unique` ON `push_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_sensor_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sensor_id` integer NOT NULL,
	`update_interval_seconds` integer DEFAULT 30 NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	`min_value` real,
	`max_value` real,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`sensor_id`) REFERENCES `sensors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sensor_config`("id", "sensor_id", "update_interval_seconds", "notifications_enabled", "min_value", "max_value", "created_at", "updated_at") SELECT "id", "sensor_id", "update_interval_seconds", "notifications_enabled", "min_value", "max_value", "created_at", "updated_at" FROM `sensor_config`;--> statement-breakpoint
DROP TABLE `sensor_config`;--> statement-breakpoint
ALTER TABLE `__new_sensor_config` RENAME TO `sensor_config`;--> statement-breakpoint
CREATE UNIQUE INDEX `sensor_config_sensor_id_unique` ON `sensor_config` (`sensor_id`);--> statement-breakpoint
CREATE TABLE `__new_sensors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer NOT NULL,
	`model` text NOT NULL,
	`rom_address` text NOT NULL,
	`display_name` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sensors`("id", "device_id", "model", "rom_address", "display_name", "created_at") SELECT "id", "device_id", "model", "rom_address", "display_name", "created_at" FROM `sensors`;--> statement-breakpoint
DROP TABLE `sensors`;--> statement-breakpoint
ALTER TABLE `__new_sensors` RENAME TO `sensors`;--> statement-breakpoint
CREATE UNIQUE INDEX `sensors_rom_address_unique` ON `sensors` (`rom_address`);--> statement-breakpoint
CREATE TABLE `__new_tanks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tanks`("id", "user_id", "name", "description", "created_at") SELECT "id", "user_id", "name", "description", "created_at" FROM `tanks`;--> statement-breakpoint
DROP TABLE `tanks`;--> statement-breakpoint
ALTER TABLE `__new_tanks` RENAME TO `tanks`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "external_id", "created_at") SELECT "id", "external_id", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_id_unique` ON `users` (`external_id`);