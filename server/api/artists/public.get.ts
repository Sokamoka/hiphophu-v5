import { and, desc, eq, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { artistCategories } from '../../../shared/types/artist'
import { artists } from '../../database/schema'
import { useDrizzle } from '../../utils/drizzle'

export default defineEventHandler(async (event) => {
  const rawCategories = getQuery(event).category
  const categoryValues: string[] = (Array.isArray(rawCategories) ? rawCategories : [rawCategories])
    .filter((category): category is string => typeof category === 'string')
  const categories = categoryValues.flatMap((category: string) => category.split(',').map((value: string) => value.trim()).filter(Boolean))
  const parsedCategories = z.array(z.enum(artistCategories)).safeParse(categories)

  if (!parsedCategories.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid artist category' })
  }

  const categoryFilter = parsedCategories.data.length
    ? or(...parsedCategories.data.map(category => sql`EXISTS (SELECT 1 FROM json_each(${artists.category}) WHERE value = ${category})`))
    : undefined

  return useDrizzle(event)
    .select({
      id: artists.id,
      name: artists.name,
      nameId: artists.nameId,
      description: artists.description,
      category: artists.category,
      pictures: artists.pictures,
      createdAt: artists.createdAt,
      publishedAt: artists.publishedAt
    })
    .from(artists)
    .where(and(eq(artists.isActive, true), categoryFilter))
    .orderBy(desc(artists.createdAt))
})
