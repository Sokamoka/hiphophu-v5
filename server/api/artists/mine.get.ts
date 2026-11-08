import { desc, sql } from 'drizzle-orm'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['ADMIN', 'USER'])

  return useDrizzle(event)
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      description: artists.description,
      pictures: artists.pictures,
      createdAt: artists.createdAt,
      publishedAt: artists.publishedAt
    })
    .from(artists)
    .where(sql`EXISTS (SELECT 1 FROM json_each(${artists.editor}) WHERE json_each.value = ${session.user.id})`)
    .orderBy(desc(artists.createdAt))
})
