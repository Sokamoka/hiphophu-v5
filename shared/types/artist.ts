export const artistCategories = [
  'RAP',
  'DANCE',
  'GRAFFITI',
  'DJ',
  'BEATBOX'
] as const

export type ArtistCategory = typeof artistCategories[number]
