import * as z from 'zod'
import { requireRole } from '../../utils/auth'

const bodySchema = z.object({
  url: z.string().trim().max(2048).pipe(z.url())
})

const snippetSchema = z.object({
  title: z.string(),
  description: z.string(),
  thumbnails: z.object({
    high: z.object({ url: z.url() }).optional(),
    medium: z.object({ url: z.url() }).optional(),
    default: z.object({ url: z.url() }).optional()
  })
})

const responseSchema = z.object({
  items: z.array(z.object({
    snippet: snippetSchema,
    contentDetails: z.object({ duration: z.string().min(1) })
  }))
})

function getVideoId(url: URL) {
  if (!['https:', 'http:'].includes(url.protocol)) return null
  const [, path, pathId] = url.pathname.split('/')
  let id: string | null | undefined

  if (url.hostname === 'youtu.be') {
    id = path
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else if (path && ['shorts', 'live', 'embed'].includes(path)) id = pathId
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null
}

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN', 'USER'])

  const body = bodySchema.safeParse(await readBody(event))
  const id = body.success ? getVideoId(new URL(body.data.url)) : null
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid YouTube video URL' })

  const binding = event.context.cloudflare.env.YOUTUBE_API_KEY
  const apiKey = typeof binding === 'string' && binding
    ? binding
    : (import.meta.dev ? process.env.YOUTUBE_API_KEY : undefined)
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'YouTube API is not configured' })

  let response: unknown
  try {
    response = await $fetch('https://www.googleapis.com/youtube/v3/videos', {
      query: {
        part: 'snippet,contentDetails',
        id,
        fields: 'items(snippet(title,description,thumbnails),contentDetails(duration))'
      },
      headers: { 'x-goog-api-key': apiKey },
      redirect: 'error',
      retry: 0,
      timeout: 5000
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'YouTube API lookup failed' })
  }

  const result = responseSchema.safeParse(response)
  if (!result.success) throw createError({ statusCode: 502, statusMessage: 'Invalid YouTube API response' })
  const video = result.data.items[0]
  if (!video) throw createError({ statusCode: 404, statusMessage: 'YouTube video not found' })

  const { title, description, thumbnails } = video.snippet
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title,
    description,
    duration: video.contentDetails.duration,
    image: (thumbnails.high ?? thumbnails.medium ?? thumbnails.default)?.url
  }
})
