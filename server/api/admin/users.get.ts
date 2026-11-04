import { desc } from 'drizzle-orm'
import { user } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN', 'USER'])

  return useDrizzle(event)
    .select({
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })
    .from(user)
    .orderBy(desc(user.createdAt))
})
