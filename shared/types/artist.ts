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
  links: {
    platform: string
    url: string
  }[]
}
