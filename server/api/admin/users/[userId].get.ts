import { eq } from 'drizzle-orm'
import { user } from '../../../database/schema'
import { requireRole } from '../../../utils/auth'
import { useDrizzle } from '../../../utils/drizzle'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const userId = getRouterParam(event, 'userId')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Missing user ID' })

  const [record] = await useDrizzle(event)
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, location: user.location, language: user.language, theme: user.theme })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!record) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return record
})
