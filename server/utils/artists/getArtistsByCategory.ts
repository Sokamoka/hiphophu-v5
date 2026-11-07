import { sql } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../../database/schema'

export async function getArtistsByCategory(
  db: DrizzleD1Database<typeof schema>,
  categoryName: string
) {
  return db.query.artists.findMany({
    where: sql`EXISTS (SELECT 1 FROM json_each(${schema.artists.category}) WHERE value = ${categoryName})`,
    with: { artistTags: { with: { tag: true } } }
  })
}

export type ArtistWithTags = Awaited<ReturnType<typeof getArtistsByCategory>>[number]
