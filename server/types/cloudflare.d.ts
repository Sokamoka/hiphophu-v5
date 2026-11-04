import type { D1Database } from '@cloudflare/workers-types'

declare module 'h3' {
  interface H3EventContext {
    cloudflare: {
      env: {
        DB: D1Database
        BETTER_AUTH_SECRET: string
      }
    }
    _auth?: unknown
  }
}

export {}
