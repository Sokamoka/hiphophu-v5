import { blob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  const { pathname } = getRouterParams(event)
  if (!pathname) {
    throw createError({ statusCode: 400, statusMessage: 'Missing pathname' })
  }
  return blob.serve(event, pathname)
})
