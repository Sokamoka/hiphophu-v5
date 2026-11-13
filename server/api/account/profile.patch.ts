import { eq } from 'drizzle-orm'
import * as z from 'zod'
import { user } from '../../database/schema'
import { useServerAuth } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'
import { userProfileFields } from '../../utils/userProfile'

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  ...userProfileFields
})

export default defineEventHandler(async (event) => {
  const session = await useServerAuth(event).api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const result = profileSchema.safeParse(await readBody(event))
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid profile data' })

  const [updatedUser] = await useDrizzle(event)
    .update(user)
    .set(result.data)
    .where(eq(user.id, session.user.id))
    .returning({ id: user.id, name: user.name, email: user.email, location: user.location, language: user.language, theme: user.theme })

  if (!updatedUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return updatedUser
})
