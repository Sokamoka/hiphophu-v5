import { blob } from 'hub:blob'
import { eq } from 'drizzle-orm'
import { createError, getQuery, readFormData } from 'h3'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const { artistId } = getQuery(event)
  if (typeof artistId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(artistId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artistId' })
  }

  const db = useDrizzle(event)
  const [artist] = await db
    .select({ id: artists.id, editor: artists.editor, pictures: artists.pictures })
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
    throw createError({ statusCode: 400, statusMessage: 'No valid avatar file provided' })
  }

  const file = files[0]
  if (file.size === 0 || file.size > 1024 * 1024 || file.type !== 'image/webp') {
    throw createError({ statusCode: 400, statusMessage: 'Avatar must be a WebP image no larger than 1MB' })
  }

  const uploadedFile = await blob.put(
    `${artistId}/avatar-${crypto.randomUUID()}.webp`,
    file,
    { addRandomSuffix: false }
  )
  const avatar = `/images/${uploadedFile.pathname}`

  await db
    .update(artists)
    .set({
      pictures: { ...artist.pictures, avatar },
      updatedAt: new Date()
    })
    .where(eq(artists.id, artistId))

  return { avatar }
})
