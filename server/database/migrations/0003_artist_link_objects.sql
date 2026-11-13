UPDATE artists
SET links = (
  SELECT json_group_array(json(link))
  FROM (
    SELECT CASE
      WHEN type = 'text' THEN json_object('platform', 'site', 'url', value)
      ELSE value
    END AS link
    FROM json_each(artists.links)
    ORDER BY CAST(key AS INTEGER)
  )
)
WHERE EXISTS (
  SELECT 1 FROM json_each(artists.links) WHERE type = 'text'
);