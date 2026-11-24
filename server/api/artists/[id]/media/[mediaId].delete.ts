import { blob } from 'hub:blob'
import { and, eq, ne, notExists } from 'drizzle-orm'
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

  const [mediaItem] = await db
    .select({ type: media.type, url: media.url })
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1)

  const otherLinks = await db
    .select({ artistId: artistMedia.artistId })
    .from(artistMedia)
    .where(and(eq(artistMedia.mediaId, mediaId), ne(artistMedia.artistId, artistId)))

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

  if (mediaItem?.type === 'image' && otherLinks.length === 0) {
    const imagePath = /^\/images\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)$/.exec(mediaItem.url)
    if (imagePath?.[1] && imagePath[2]) {
      await blob.del(`${imagePath[1]}/${imagePath[2]}`)
    }
  }

  return { success: true }
})
