import { and, eq, notExists } from 'drizzle-orm'
import { artistMedia, media } from '../../../../database/schema'
import { requireEditableArtists } from '../../../../utils/media-permissions'
import { useDrizzle } from '../../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const artistId = getRouterParam(event, 'id')
  const mediaId = getRouterParam(event, 'mediaId')
  if (!artistId) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })
  if (!mediaId) throw createError({ statusCode: 400, statusMessage: 'Media ID is required' })

  await requireEditableArtists(event, [artistId])

  const db = useDrizzle(event)
  const [artistMediaLink] = await db
    .select({ mediaId: artistMedia.mediaId })
    .from(artistMedia)
    .where(and(eq(artistMedia.artistId, artistId), eq(artistMedia.mediaId, mediaId)))
    .limit(1)

  if (!artistMediaLink) throw createError({ statusCode: 404, statusMessage: 'Media not found for this artist' })

  await db.batch([
    db.delete(artistMedia)
      .where(and(eq(artistMedia.artistId, artistId), eq(artistMedia.mediaId, mediaId))),
    db.delete(media)
      .where(and(
        eq(media.id, mediaId),
        notExists(db.select({ mediaId: artistMedia.mediaId })
          .from(artistMedia)
          .where(eq(artistMedia.mediaId, media.id)))
      ))
  ])

  return { success: true }
})
