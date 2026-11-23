import { and, eq, inArray } from 'drizzle-orm'
import * as z from 'zod'
import { artistMedia, media } from '../../../../database/schema'
import { requireEditableArtists } from '../../../../utils/media-permissions'
import { useDrizzle } from '../../../../utils/drizzle'

const bodySchema = z.object({
  mediaIds: z.array(z.string().min(1)).min(1)
    .refine(ids => new Set(ids).size === ids.length, 'Media IDs must be unique')
}).strict()

export default defineEventHandler(async (event) => {
  const artistId = getRouterParam(event, 'id')
  if (!artistId) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })

  const body = bodySchema.safeParse(await readBody(event))
  if (!body.success) throw createError({ statusCode: 400, statusMessage: 'Invalid media order' })
  await requireEditableArtists(event, [artistId])

  const { mediaIds } = body.data
  const db = useDrizzle(event)
  const linkedItems = await db
    .select({ id: media.id, type: media.type })
    .from(artistMedia)
    .innerJoin(media, eq(artistMedia.mediaId, media.id))
    .where(and(
      eq(artistMedia.artistId, artistId),
      inArray(media.id, mediaIds)
    ))

  if (linkedItems.length !== mediaIds.length || new Set(linkedItems.map(item => item.type)).size !== 1) {
    throw createError({ statusCode: 400, statusMessage: 'Media must belong to this artist and share one type' })
  }

  const statements = mediaIds.map((mediaId, sortOrder) => db
    .update(artistMedia)
    .set({ sortOrder })
    .where(and(eq(artistMedia.artistId, artistId), eq(artistMedia.mediaId, mediaId))))
  const [firstStatement, ...remainingStatements] = statements
  if (!firstStatement) throw createError({ statusCode: 400, statusMessage: 'At least one media item is required' })

  await db.batch([firstStatement, ...remainingStatements])

  return { success: true }
})
