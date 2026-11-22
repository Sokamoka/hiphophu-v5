import { z } from 'zod'

export const artistLinkUrlSchema = z.string()
  .min(1, 'Required')
  .refine(
    value => !value || z.url().safeParse(value).success || z.email().safeParse(value).success,
    'Invalid URL or email'
  )

export const artistLinkSchema = z.object({
  platform: z.string(),
  url: artistLinkUrlSchema
})

export type ArtistLink = z.output<typeof artistLinkSchema>

export const artistCategories = [
  'RAP',
  'DANCE',
  'GRAFFITI',
  'DJ',
  'BEATBOX',
  'BEATMAKER'
] as const

export const artistCategorySchema = z.enum(artistCategories)

export type ArtistCategory = z.output<typeof artistCategorySchema>

export interface ArtistFormState {
  isActive: boolean
  name: string
  nameId: string
  isTeam: boolean | null
  category: ArtistCategory[]
  description: string
  links: ArtistLink[]
  avatar?: string
  hero?: string
}
