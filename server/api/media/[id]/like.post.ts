import { eq, sql } from 'drizzle-orm'
import { media } from '../../../database/schema'
import { useDrizzle } from '../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Media ID is required' })

  const [updated] = await useDrizzle(event)
    .update(media)
    .set({ likes: sql`${media.likes} + 1` })
    .where(eq(media.id, id))
    .returning({ likes: media.likes })

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  return updated
})
