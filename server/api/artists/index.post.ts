import * as z from 'zod'
import { artistCategories } from '../../../shared/types/artist'
import { requireRole } from '../../utils/auth'
import { useDrizzle } from '../../utils/drizzle'
import { saveArtist } from '../../utils/artists/saveArtist'

const bodySchema = z.object({
  name: z.string().min(2),
  nameId: z.string().min(2),
  isTeam: z.boolean(),
  category: z.array(z.enum(artistCategories)).min(1),
  description: z.string(),
  links: z.array(z.object({
    platform: z.string(),
    url: z.url()
  }))
})

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['ADMIN', 'USER'])

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid artist data' })

  const { links, ...data } = result.data
  const now = new Date()

  try {
    return await saveArtist(useDrizzle(event), {
      ...data,
      id: crypto.randomUUID().replaceAll('-', '').slice(0, 12),
      links: links.map(link => link.url),
      editor: [session.user.id],
      createdAt: now,
      updatedAt: now
    })
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint/i.test(`${error.message} ${String(error.cause)}`)) {
      throw createError({ statusCode: 409, statusMessage: 'nameId already exists' })
    }
    throw error
  }
})
