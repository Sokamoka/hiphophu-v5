import { eq } from 'drizzle-orm'
import * as z from 'zod'
import { artists } from '../../database/schema'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'
import { artistCategories, artistLinkSchema } from '../../../shared/types/artist'

const bodySchema = z.object({
  isActive: z.boolean(),
  name: z.string().min(2),
  nameId: z.string().min(2),
  isTeam: z.boolean(),
  category: z.array(z.enum(artistCategories)).min(1),
  description: z.string(),
  links: z.array(artistLinkSchema)
})

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['ADMIN', 'USER'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid artist data' })

  const db = useDrizzle(event)
  const [artist] = await db
    .select({ id: artists.id, editor: artists.editor })
    .from(artists)
    .where(eq(artists.id, id))
    .limit(1)

  if (!artist) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && !artist.editor.includes(session.user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    await db
      .update(artists)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(artists.id, id))
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint/i.test(`${error.message} ${String(error.cause)}`)) {
      throw createError({ statusCode: 409, statusMessage: 'nameId already exists' })
    }
    throw error
  }

  return { id }
})
