ALTER TABLE `artists` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `artists` ADD `hero` text;--> statement-breakpoint
UPDATE artists
SET (avatar, hero) = (
  SELECT
    max(CASE WHEN key = 'avatar' THEN filename END),
    max(CASE WHEN key = 'header' THEN filename END)
  FROM (
    SELECT key, CASE
      WHEN instr(value, '/images/' || artists.id || '/') = 1
        THEN substr(value, length('/images/' || artists.id || '/') + 1)
      ELSE value
    END AS filename
    FROM json_each(CASE WHEN json_valid(artists.pictures) THEN artists.pictures END)
    WHERE key IN ('avatar', 'header') AND type = 'text'
  )
  WHERE filename GLOB '?*.?*' AND filename NOT GLOB '*[^a-zA-Z0-9._-]*'
);--> statement-breakpoint
ALTER TABLE `artists` DROP COLUMN `pictures`;