export const mediaTypes = ['image', 'video'] as const
export const artistMediaRoles = ['primary', 'featured'] as const

export type MediaType = typeof mediaTypes[number]
export type ArtistMediaRole = typeof artistMediaRoles[number]

export interface MediaArtist {
  id: string
  name: string
  role: ArtistMediaRole
}

interface MediaBase {
  id: string
  sourceId: string
  thumbnail: string
  title: string
  likes: number
  createdAt: Date
  sortOrder: number
  artists: MediaArtist[]
}

export interface ImageMedia extends MediaBase {
  type: 'image'
}

export interface StreamMedia extends MediaBase {
  type: 'video'
  duration: string
  description: string
}

export type MediaItem = ImageMedia | StreamMedia
