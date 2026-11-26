CREATE TABLE IF NOT EXISTS `__media_source_migration` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `source_id` text NOT NULL,
  `thumbnail` text NOT NULL,
  CONSTRAINT `unsupported_media_source_or_thumbnail` CHECK (
    (`type` = 'video'
      AND length(`source_id`) = 11
      AND `source_id` NOT GLOB '*[^a-zA-Z0-9_-]*')
    OR
    (`type` = 'image'
      AND `source_id` GLOB '?*/?*'
      AND `source_id` NOT GLOB '*/*/*'
      AND `source_id` NOT GLOB '*[^a-zA-Z0-9._/-]*'
      AND substr(`source_id`, 1, instr(`source_id`, '/') - 1) NOT GLOB '*[^a-zA-Z0-9_-]*'
      AND substr(`source_id`, instr(`source_id`, '/') + 1) NOT IN ('.', '..')
      AND `thumbnail` GLOB '?*/?*'
      AND `thumbnail` NOT GLOB '*/*/*'
      AND `thumbnail` NOT GLOB '*[^a-zA-Z0-9._/-]*'
      AND substr(`thumbnail`, 1, instr(`thumbnail`, '/') - 1) NOT GLOB '*[^a-zA-Z0-9_-]*'
      AND substr(`thumbnail`, instr(`thumbnail`, '/') + 1) NOT IN ('.', '..'))
  )
);--> statement-breakpoint
DELETE FROM `__media_source_migration`;--> statement-breakpoint
WITH urls AS (
  SELECT *, substr(`url`, 1, instr(`url` || '#', '#') - 1) AS clean_url FROM `media`
), hosts AS (
  SELECT *, CASE
    WHEN clean_url LIKE 'https://%' THEN substr(clean_url, 9)
    WHEN clean_url LIKE 'http://%' THEN substr(clean_url, 8)
  END AS host_path FROM urls
), parts AS (
  SELECT *,
    lower(substr(host_path, 1, instr(host_path || '/', '/') - 1)) AS host,
    CASE WHEN instr(host_path, '/') > 0 THEN substr(host_path, instr(host_path, '/')) END AS path
  FROM hosts
), candidates AS (
  SELECT *, CASE
    WHEN `type` = 'image' AND `url` LIKE '/images/%' THEN substr(`url`, 9)
    WHEN `type` = 'video' AND host = 'youtu.be' THEN substr(path, 2)
    WHEN `type` = 'video' AND host IN ('youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com')
      AND path LIKE '/watch?%' AND instr('&' || substr(path, 8), '&v=') > 0
      THEN substr('&' || substr(path, 8), instr('&' || substr(path, 8), '&v=') + 3)
    WHEN `type` = 'video' AND host IN ('youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com')
      AND (path LIKE '/shorts/%' OR path LIKE '/live/%' OR path LIKE '/embed/%')
      THEN substr(path, instr(substr(path, 2), '/') + 2)
  END AS candidate
  FROM parts
)
INSERT INTO `__media_source_migration` (`id`, `type`, `source_id`, `thumbnail`)
SELECT `id`, `type`,
  CASE WHEN `type` = 'video'
    THEN substr(candidate, 1, min(instr(candidate || '?', '?'), instr(candidate || '&', '&')) - 1)
    ELSE candidate
  END,
  CASE WHEN `type` = 'image' AND `thumbnail` LIKE '/images/%' THEN substr(`thumbnail`, 9)
    WHEN `type` = 'video' THEN `thumbnail`
  END
FROM candidates;--> statement-breakpoint
ALTER TABLE `media` RENAME COLUMN `url` TO `source_id`;--> statement-breakpoint
UPDATE `media`
SET `source_id` = (SELECT `source_id` FROM `__media_source_migration` WHERE `id` = `media`.`id`),
    `thumbnail` = (SELECT `thumbnail` FROM `__media_source_migration` WHERE `id` = `media`.`id`);--> statement-breakpoint
DROP TABLE `__media_source_migration`;