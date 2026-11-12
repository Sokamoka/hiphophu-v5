ALTER TABLE `user` ADD `nickname` text;--> statement-breakpoint
ALTER TABLE `user` ADD `location` text;--> statement-breakpoint
ALTER TABLE `user` ADD `language` text DEFAULT 'hu' NOT NULL;