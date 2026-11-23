import { sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { artistMediaRoles, mediaTypes } from '../../../shared/types/media'
import { artists } from './artists'

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  type: text('type', { enum: mediaTypes }).notNull(),
  url: text('url').notNull(),
  thumbnail: text('thumbnail').notNull(),
  title: text('title').notNull(),
  likes: integer('likes').notNull().default(0),
  duration: text('duration'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const artistMedia = sqliteTable('artist_media', {
  artistId: text('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  role: text('role', { enum: artistMediaRoles }).notNull().default('primary'),
  sortOrder: integer('sort_order').notNull().default(0)
}, table => [
  primaryKey({ columns: [table.artistId, table.mediaId] }),
  index('artist_media_artist_sort_order_idx').on(table.artistId, table.sortOrder),
  index('artist_media_media_id_idx').on(table.mediaId)
])

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
export type ArtistMedia = typeof artistMedia.$inferSelect
export type NewArtistMedia = typeof artistMedia.$inferInsert
