import * as z from 'zod'
import { artistMediaRoles } from '../../../shared/types/media'
import { artistMedia, media } from '../../database/schema'
import { requireEditableArtists } from '../../utils/media-permissions'
import { useDrizzle } from '../../utils/drizzle'

const bodySchema = z.object({
  type: z.literal('video'),
  sourceId: z.string().regex(/^[\w-]{11}$/),
  thumbnail: z.string().max(2048).pipe(z.url()),
  title: z.string().min(1).max(500),
  duration: z.string().min(1).max(100),
  description: z.string(),
  artists: z.array(z.object({
    artistId: z.string().min(1),
    role: z.enum(artistMediaRoles)
  }).strict()).min(1)
}).strict()

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
      sourceId: data.sourceId,
      thumbnail: data.thumbnail,
      title: data.title,
      duration: data.duration,
      description: data.description
    }),
    firstArtistStatement,
    ...remainingArtistStatements
  ])
  return { id }
})
