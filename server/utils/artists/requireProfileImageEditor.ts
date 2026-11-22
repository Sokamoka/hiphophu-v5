import { eq } from 'drizzle-orm'
import { createError, getQuery, type H3Event } from 'h3'
import { artists } from '../../database/schema'
import { requireRole } from '../auth'
import { useDrizzle } from '../drizzle'

export async function requireProfileImageEditor(event: H3Event) {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const { artistId } = getQuery(event)
  if (typeof artistId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(artistId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artistId' })
  }

  const db = useDrizzle(event)
  const [artist] = await db
    .select({ id: artists.id, editor: artists.editor, avatar: artists.avatar, hero: artists.hero })
    .from(artists)
    .where(eq(artists.id, artistId))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && !artist.editor.includes(session.user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return { artist, db }
}
