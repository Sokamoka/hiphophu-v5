import type { D1Database } from '@cloudflare/workers-types'

declare module 'h3' {
  interface H3EventContext {
    cloudflare: {
      env: {
        DB: D1Database
        BETTER_AUTH_SECRET: string
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        YOUTUBE_API_KEY?: string
      }
    }
    _auth?: unknown
  }
}

export {}
