import { inArray } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { artists } from '../database/schema'
import { requireRole } from './auth'
import { useDrizzle } from './drizzle'

export async function requireEditableArtists(event: H3Event, artistIds: string[]) {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const uniqueIds = [...new Set(artistIds)]

  if (!uniqueIds.length || uniqueIds.length !== artistIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artist IDs' })
  }

  const artistRows = await useDrizzle(event)
    .select({ id: artists.id, name: artists.name, editor: artists.editor })
    .from(artists)
    .where(inArray(artists.id, uniqueIds))

  if (artistRows.length !== uniqueIds.length) {
    throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
  }

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && artistRows.some(artist => !artist.editor.includes(session.user.id))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return artistRows
}
