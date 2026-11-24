import { blob } from 'hub:blob'
import { and, desc, eq } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'
import { createError, getQuery, readFormData } from 'h3'
import { artistMedia, media } from '../../database/schema'
import { requireEditableArtists } from '../../utils/media-permissions'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const { artistId } = getQuery(event)
  if (typeof artistId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(artistId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artistId' })
  }

  await requireEditableArtists(event, [artistId])

  const db = useDrizzle(event)
  const formData = await readFormData(event)
  const files = formData.getAll('files')
  if (files.length === 0 || !files.every((file): file is File => file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'No valid files provided' })
  }

  for (const file of files) {
    if (file.size === 0 || file.size > 1024 * 1024 || file.type !== 'image/webp') {
      throw createError({ statusCode: 400, statusMessage: 'Files must be WebP images no larger than 1MB' })
    }
  }

  const [lastImage] = await db
    .select({ sortOrder: artistMedia.sortOrder })
    .from(artistMedia)
    .innerJoin(media, eq(artistMedia.mediaId, media.id))
    .where(and(eq(artistMedia.artistId, artistId), eq(media.type, 'image')))
    .orderBy(desc(artistMedia.sortOrder))
    .limit(1)

  const uploadedImages = await Promise.all(files.map(async (file, index) => {
    const id = crypto.randomUUID()
    const filename = `${crypto.randomUUID()}.webp`
    const pathname = `${artistId}/${filename}`
    await blob.put(pathname, file, { addRandomSuffix: false })

    return {
      id,
      pathname,
      url: `/images/${pathname}`,
      title: file.name.replace(/\.[^.]+$/, '').slice(0, 500) || 'Kép',
      sortOrder: (lastImage?.sortOrder ?? -1) + index + 1
    }
  }))

  const statements: BatchItem<'sqlite'>[] = uploadedImages.flatMap(image => [
    db.insert(media).values({
      id: image.id,
      type: 'image',
      url: image.url,
      thumbnail: image.url,
      title: image.title
    }),
    db.insert(artistMedia).values({
      artistId,
      mediaId: image.id,
      sortOrder: image.sortOrder
    })
  ])
  const [firstStatement, ...remainingStatements] = statements
  if (!firstStatement) throw createError({ statusCode: 400, statusMessage: 'No valid files provided' })
  await db.batch([firstStatement, ...remainingStatements])

  return uploadedImages.map(({ id, pathname }) => ({ id, pathname }))
})
