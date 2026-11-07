import { desc } from 'drizzle-orm'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  return useDrizzle(event)
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      category: artists.category,
      isActive: artists.isActive,
      createdAt: artists.createdAt
    })
    .from(artists)
    .orderBy(desc(artists.createdAt))
})
