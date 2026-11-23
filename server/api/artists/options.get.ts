import { asc } from 'drizzle-orm'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN', 'USER'])

  return useDrizzle(event)
    .select({ id: artists.id, name: artists.name })
    .from(artists)
    .orderBy(asc(artists.name), asc(artists.id))
})
