CREATE TABLE `artist_media` (
	`artist_id` text NOT NULL,
	`media_id` text NOT NULL,
	`role` text DEFAULT 'primary' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`artist_id`, `media_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `artist_media_artist_sort_order_idx` ON `artist_media` (`artist_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `artist_media_media_id_idx` ON `artist_media` (`media_id`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`thumbnail` text NOT NULL,
	`title` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`duration` text,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
