import { and, eq, inArray, sql } from 'drizzle-orm'
import { artists } from '../../../database/schema'
import { useDrizzle } from '../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const nameId = getRouterParam(event, 'nameId')

  if (!nameId) throw createError({ statusCode: 400, statusMessage: 'Artist name_id is required' })

  const db = useDrizzle(event)
  const [artist] = await db
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      description: artists.description,
      isTeam: artists.isTeam,
      category: artists.category,
      links: artists.links,
      connections: artists.connections,
      avatar: artists.avatar,
      hero: artists.hero,
      videos: artists.videos,
      images: artists.images
    })
    .from(artists)
    .where(and(eq(artists.nameId, nameId), eq(artists.isActive, true)))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  const { connections, ...profile } = artist
  if (!connections.length) return { ...profile, connections: [] }

  const relatedArtists = await db
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      avatar: artists.avatar
    })
    .from(artists)
    .where(and(
      eq(artists.isActive, true),
      inArray(artists.id, sql`(select value from json_each(${JSON.stringify(connections)}))`)
    ))

  const relatedById = new Map(relatedArtists.map(related => [related.id, related]))

  return {
    ...profile,
    connections: [...new Set(connections)].map(id => relatedById.get(id)).filter(related => related !== undefined)
  }
})
