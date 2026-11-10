import { eq } from 'drizzle-orm'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })

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
      editor: artists.editor
    })
    .from(artists)
    .where(eq(artists.id, id))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && !artist.editor.includes(session.user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { editor, ...artistData } = artist
  return artistData
})
