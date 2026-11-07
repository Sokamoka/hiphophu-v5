import { and, eq, notInArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { BatchItem } from 'drizzle-orm/batch'
import * as schema from '../../database/schema'
import { artistInputSchema } from './validation'

const { artists, tags, artistTags } = schema

// D1 limits bound parameters per statement (100), so inserts are chunked
const CHUNK = 40

const chunk = <T>(items: T[], size = CHUNK): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** Trim + lowercase + dedupe. The normalized name doubles as a deterministic tag id. */
export const normalizeTags = (raw: string[]): string[] =>
  [...new Set(raw.map(t => t.trim().toLowerCase()).filter(Boolean))]

export async function saveArtist(db: DrizzleD1Database<typeof schema>, rawInput: unknown) {
  const { tags: rawTags, ...artist } = artistInputSchema.parse(rawInput)
  const tagNames = normalizeTags(rawTags)

  const { id: _id, ...updateValues } = artist
  const statements: BatchItem<'sqlite'>[] = [
    db.insert(artists).values(artist).onConflictDoUpdate({ target: artists.id, set: updateValues })
  ]

  for (const part of chunk(tagNames)) {
    statements.push(
      db.insert(tags).values(part.map(name => ({ id: name, name }))).onConflictDoNothing()
    )
  }

  // Sync links: remove stale ones, add current ones (existing rows are ignored)
  statements.push(
    tagNames.length
      ? db.delete(artistTags).where(and(eq(artistTags.artistId, artist.id), notInArray(artistTags.tagId, tagNames)))
      : db.delete(artistTags).where(eq(artistTags.artistId, artist.id))
  )
  for (const part of chunk(tagNames)) {
    statements.push(
      db.insert(artistTags).values(part.map(tagId => ({ artistId: artist.id, tagId }))).onConflictDoNothing()
    )
  }

  await db.batch(statements as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]])
  return { id: artist.id, tags: tagNames }
}
