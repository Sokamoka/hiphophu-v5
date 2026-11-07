CREATE TABLE `artist_tags` (
	`artist_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `tag_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_id` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_team` integer DEFAULT false NOT NULL,
	`category` text NOT NULL,
	`connections` text NOT NULL,
	`videos` text NOT NULL,
	`images` text NOT NULL,
	`editor` text NOT NULL,
	`links` text NOT NULL,
	`pictures` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artists_name_id_unique` ON `artists` (`name_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);