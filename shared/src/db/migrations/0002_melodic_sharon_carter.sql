ALTER TABLE `push_tokens` ADD `updated_at` text DEFAULT (datetime('now')) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `push_tokens_user_id_unique` ON `push_tokens` (`user_id`);