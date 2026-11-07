import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'drizzle-kit'

const localD1Directory = resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject')
const localD1File = readdirSync(localD1Directory)
  .find(file => file.endsWith('.sqlite') && file !== 'metadata.sqlite')

if (!localD1File) {
  throw new Error('Local Wrangler D1 database not found. Start the app locally first.')
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema/index.ts',
  dbCredentials: {
    url: resolve(localD1Directory, localD1File)
  }
})
