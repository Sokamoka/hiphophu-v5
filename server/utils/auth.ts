import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'
import * as z from 'zod'
import { getRequestURL, createError, type H3Event } from 'h3'
import { schema, useDrizzle } from './drizzle'
import { LANGUAGES, type Role } from '../database/schema'

const statement = { ...defaultStatements, post: ['create', 'update', 'delete', 'publish'] } as const
export const ac = createAccessControl(statement)
export const roles = {
  ADMIN: ac.newRole({ ...adminAc.statements, post: ['create', 'update', 'delete', 'publish'] }),
  EDITOR: ac.newRole({ post: ['create', 'update', 'publish'] }),
  USER: ac.newRole({ post: [] })
}

function createAuth(event: H3Event) {
  const { env } = event.context.cloudflare
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = env
  if (typeof clientId !== 'string' || !clientId || typeof clientSecret !== 'string' || !clientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Google authentication is not configured' })
  }
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET as string | undefined,
    baseURL: getRequestURL(event).origin,
    database: drizzleAdapter(useDrizzle(event), { provider: 'sqlite', schema }),
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        nickname: { type: 'string', required: false, input: true },
        location: { type: 'string', required: false, input: true },
        language: { type: 'string', required: false, input: true, defaultValue: 'hu', validator: { input: z.enum(LANGUAGES) } }
      }
    },
    socialProviders: {
      google: {
        clientId,
        clientSecret
      }
    },
    plugins: [
      admin({ ac, roles, defaultRole: 'USER', adminRoles: ['ADMIN'] })
    ]
  })
}

export type Auth = ReturnType<typeof createAuth>

// Bindings only exist at request time, so build one instance per request
export function useServerAuth(event: H3Event): Auth {
  return (event.context._auth ??= createAuth(event)) as Auth
}

export async function requireRole(event: H3Event, allowed: Role[]) {
  const data = await useServerAuth(event).api.getSession({ headers: event.headers })
  if (!data) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (!allowed.includes((data.user as { role?: Role }).role as Role)) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return data
}
