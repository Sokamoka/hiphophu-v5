import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import * as z from 'zod'
import { mediaTypes } from '../../../../shared/types/media'
import { artistMedia, artists, media } from '../../../database/schema'
import { useDrizzle } from '../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const artistId = getRouterParam(event, 'id')
  if (!artistId) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })

  const type = z.enum(mediaTypes).safeParse(getQuery(event).type)
  if (!type.success) throw createError({ statusCode: 400, statusMessage: 'A valid media type is required' })

  const db = useDrizzle(event)
  const items = await db
    .select({
      id: media.id,
      type: media.type,
      url: media.url,
      thumbnail: media.thumbnail,
      title: media.title,
      likes: media.likes,
      duration: media.duration,
      description: media.description,
      createdAt: media.createdAt,
      sortOrder: artistMedia.sortOrder
    })
    .from(artistMedia)
    .innerJoin(media, eq(artistMedia.mediaId, media.id))
    .where(and(eq(artistMedia.artistId, artistId), eq(media.type, type.data)))
    .orderBy(asc(artistMedia.sortOrder), desc(media.createdAt))

  if (!items.length) return []

  const collaborators = await db
    .select({
      mediaId: artistMedia.mediaId,
      id: artists.id,
      name: artists.name,
      role: artistMedia.role
    })
    .from(artistMedia)
    .innerJoin(artists, eq(artistMedia.artistId, artists.id))
    .where(inArray(artistMedia.mediaId, items.map(item => item.id)))

  const artistsByMedia = new Map<string, typeof collaborators>()
  for (const collaborator of collaborators) {
    const list = artistsByMedia.get(collaborator.mediaId) ?? []
    list.push(collaborator)
    artistsByMedia.set(collaborator.mediaId, list)
  }

  return items.map((item) => {
    const artists = artistsByMedia.get(item.id) ?? []
    if (item.type === 'image') {
      return {
        id: item.id,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        title: item.title,
        likes: item.likes,
        createdAt: item.createdAt,
        sortOrder: item.sortOrder,
        artists
      }
    }

    return {
      id: item.id,
      type: item.type,
      url: item.url,
      thumbnail: item.thumbnail,
      title: item.title,
      likes: item.likes,
      duration: item.duration ?? '',
      description: item.description ?? '',
      createdAt: item.createdAt,
      sortOrder: item.sortOrder,
      artists
    }
  })
})
