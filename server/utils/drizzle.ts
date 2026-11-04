import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import * as schema from '../database/schema'

export { schema }
export const useDrizzle = (event: H3Event) => drizzle(event.context.cloudflare.env.DB, { schema })
export type DrizzleDB = ReturnType<typeof useDrizzle>
