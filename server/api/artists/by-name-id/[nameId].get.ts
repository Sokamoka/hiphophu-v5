import { and, eq } from 'drizzle-orm'
import { artists } from '../../../database/schema'
import { useDrizzle } from '../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const nameId = getRouterParam(event, 'nameId')

  if (!nameId) throw createError({ statusCode: 400, statusMessage: 'Artist name_id is required' })

  const [artist] = await useDrizzle(event)
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      description: artists.description,
      isTeam: artists.isTeam,
      category: artists.category,
      links: artists.links,
      pictures: artists.pictures,
      videos: artists.videos,
      images: artists.images
    })
    .from(artists)
    .where(and(eq(artists.nameId, nameId), eq(artists.isActive, true)))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  return artist
})
