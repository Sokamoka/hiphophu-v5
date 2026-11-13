import { z } from 'zod'

export const artistLinkSchema = z.object({
  platform: z.string(),
  url: z.url()
})

export type ArtistLink = z.output<typeof artistLinkSchema>

export const artistCategories = [
  'RAP',
  'DANCE',
  'GRAFFITI',
  'DJ',
  'BEATBOX'
] as const

export type ArtistCategory = typeof artistCategories[number]

export interface ArtistFormState {
  isActive: boolean
  name: string
  nameId: string
  isTeam: boolean | null
  category: ArtistCategory[]
  description: string
  links: ArtistLink[]
}
