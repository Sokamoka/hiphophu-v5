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

export const artistLinkPlatformIcons = new Map<string, string>([
  ['site', 'i-ph-globe'],
  ['email', 'i-ph-envelope'],
  ['youtube', 'i-simple-icons-youtube'],
  ['instagram', 'i-simple-icons-instagram'],
  ['facebook', 'i-simple-icons-facebook'],
  ['tiktok', 'i-simple-icons-tiktok'],
  ['spotify', 'i-simple-icons-spotify'],
  ['applemusic', 'i-simple-icons-applemusic'],
  ['youtubemusic', 'i-simple-icons-youtubemusic'],
  ['linkedin', 'i-simple-icons-linkedin']
])

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

export const artistConnectionsSchema = z.array(z.string().min(1))

export interface ArtistFormState {
  id?: string
  isActive: boolean
  name: string
  nameId: string
  isTeam: boolean | null
  category: ArtistCategory[]
  connections: string[]
  description: string
  links: ArtistLink[]
  avatar?: string | null
  hero?: string | null
}
