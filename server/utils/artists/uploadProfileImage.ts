import { blob } from 'hub:blob'
import { eq } from 'drizzle-orm'
import { createError, readFormData } from 'h3'
import type { H3Event } from 'h3'
import { artists } from '../../database/schema'
import { requireProfileImageEditor } from './requireProfileImageEditor'

export async function uploadProfileImage(event: H3Event, field: 'avatar' | 'hero') {
  const { artist: { id: artistId }, db } = await requireProfileImageEditor(event)

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
