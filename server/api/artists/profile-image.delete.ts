import { blob } from 'hub:blob'
import { and, eq } from 'drizzle-orm'
import { createError, getQuery } from 'h3'
import { artists } from '../../database/schema'
import { requireProfileImageEditor } from '../../utils/artists/requireProfileImageEditor'

export default defineEventHandler(async (event) => {
  const { artist, db } = await requireProfileImageEditor(event)
  const { field } = getQuery(event)
  if (field !== 'avatar' && field !== 'hero') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid profile image field' })
  }

  const filename = artist[field]
  if (filename === null) return { filename: null }
  if (!/^[a-zA-Z0-9._-]+$/.test(filename) || filename === '.' || filename === '..') {
    throw createError({ statusCode: 409, statusMessage: 'Invalid stored image filename' })
  }

  const otherField = field === 'avatar' ? 'hero' : 'avatar'
  const shared = artist[otherField] === filename
  if (!shared) await blob.del(`${artist.id}/${filename}`)

  const [updated] = await db
    .update(artists)
    .set({ [field]: null, updatedAt: new Date() })
    .where(and(
      eq(artists.id, artist.id),
      eq(artists[field], filename),
      shared ? eq(artists[otherField], filename) : undefined
    ))
    .returning({ id: artists.id })

  if (!updated) {
    throw createError({ statusCode: 409, statusMessage: 'Profile image has changed; reload and try again' })
  }

  return { filename: null }
})
