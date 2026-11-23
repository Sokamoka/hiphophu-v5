import * as z from 'zod'
import { artistMediaRoles, mediaTypes } from '../../../shared/types/media'
import { artistMedia, media } from '../../database/schema'
import { requireEditableArtists } from '../../utils/media-permissions'
import { useDrizzle } from '../../utils/drizzle'

const commonFields = {
  url: z.string().max(2048).pipe(z.url()),
  thumbnail: z.string().max(2048).pipe(z.url()),
  title: z.string().min(1).max(500),
  artists: z.array(z.object({
    artistId: z.string().min(1),
    role: z.enum(artistMediaRoles)
  }).strict()).min(1)
}

const bodySchema = z.discriminatedUnion('type', [
  z.object({ ...commonFields, type: z.literal('image') }).strict(),
  z.object({
    ...commonFields,
    type: z.enum(mediaTypes).extract(['video', 'music']),
    duration: z.string().min(1).max(100),
    description: z.string()
  }).strict()
])

export default defineEventHandler(async (event) => {
  const body = bodySchema.safeParse(await readBody(event))
  if (!body.success) throw createError({ statusCode: 400, statusMessage: 'Invalid media data' })

  const data = body.data
  const artistIds = data.artists.map(artist => artist.artistId)
  await requireEditableArtists(event, artistIds)

  const id = crypto.randomUUID()
  const db = useDrizzle(event)
  const artistStatements = data.artists.map(artist => db.insert(artistMedia).values({
    artistId: artist.artistId,
    mediaId: id,
    role: artist.role
  }))
  const [firstArtistStatement, ...remainingArtistStatements] = artistStatements
  if (!firstArtistStatement) throw createError({ statusCode: 400, statusMessage: 'At least one artist is required' })

  await db.batch([
    db.insert(media).values({
      id,
      type: data.type,
      url: data.url,
      thumbnail: data.thumbnail,
      title: data.title,
      duration: data.type === 'image' ? null : data.duration,
      description: data.type === 'image' ? null : data.description
    }),
    firstArtistStatement,
    ...remainingArtistStatements
  ])
  return { id }
})
