import { blob } from 'hub:blob'
import { eq } from 'drizzle-orm'
import { createError, getQuery, readFormData } from 'h3'
import type { H3Event } from 'h3'
import { artists } from '../../database/schema'
import { requireRole } from '../auth'
import { useDrizzle } from '../drizzle'

export async function uploadProfileImage(event: H3Event, field: 'avatar' | 'hero') {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const { artistId } = getQuery(event)
  if (typeof artistId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(artistId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artistId' })
  }

  const db = useDrizzle(event)
  const [artist] = await db
    .select({ id: artists.id, editor: artists.editor })
    .from(artists)
    .where(eq(artists.id, artistId))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && !artist.editor.includes(session.user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const formData = await readFormData(event)
  const files = formData.getAll('file')
  if (files.length !== 1 || !(files[0] instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'No valid image file provided' })
  }

  const file = files[0]
  if (file.size === 0 || file.size > 1024 * 1024 || file.type !== 'image/webp') {
    throw createError({ statusCode: 400, statusMessage: 'File must be a WebP image no larger than 1MB' })
  }

  const filename = `${crypto.randomUUID()}.webp`
  await blob.put(`${artistId}/${filename}`, file, { addRandomSuffix: false })

  await db
    .update(artists)
    .set({ [field]: filename, updatedAt: new Date() })
    .where(eq(artists.id, artistId))

  return filename
}
