import { eq } from 'drizzle-orm'
import * as z from 'zod'
import { ROLES, user } from '../../../database/schema'
import { requireRole } from '../../../utils/auth'
import { useDrizzle } from '../../../utils/drizzle'
import { userProfileFields } from '../../../utils/userProfile'

const userSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(ROLES),
  ...userProfileFields
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const userId = getRouterParam(event, 'userId')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Missing user ID' })

  const result = userSchema.safeParse(await readBody(event))
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid user data' })

  const db = useDrizzle(event)
  const [updatedUser] = await db
    .update(user)
    .set(result.data)
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name, email: user.email, role: user.role, nickname: user.nickname, location: user.location, language: user.language })

  if (!updatedUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return updatedUser
})
