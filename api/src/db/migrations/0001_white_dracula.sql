ALTER TABLE `sensors` ADD `rom_address` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `sensors_rom_address_unique` ON `sensors` (`rom_address`);