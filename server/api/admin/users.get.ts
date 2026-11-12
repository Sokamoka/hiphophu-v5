import { desc } from 'drizzle-orm'
import { user } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  return useDrizzle(event)
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      nickname: user.nickname,
      location: user.location,
      language: user.language,
      role: user.role,
      createdAt: user.createdAt
    })
    .from(user)
    .orderBy(desc(user.createdAt))
})
