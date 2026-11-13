import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import type { ArtistLink } from '../../../shared/types/artist'

const stringArray = (name: string) => text(name, { mode: 'json' }).$type<string[]>().notNull().$defaultFn(() => [])

export const artists = sqliteTable('artists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameId: text('name_id').notNull().unique(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isTeam: integer('is_team', { mode: 'boolean' }).notNull().default(false),
  category: stringArray('category'),
  connections: stringArray('connections'),
  videos: stringArray('videos'),
  images: stringArray('images'),
  editor: stringArray('editor'),
  links: text('links', { mode: 'json' }).$type<ArtistLink[]>().notNull().$defaultFn(() => []),
  pictures: text('pictures', { mode: 'json' }).$type<{ header?: string, avatar?: string }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' })
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique()
})

export const artistTags = sqliteTable('artist_tags', {
  artistId: text('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.artistId, table.tagId] })
])

export const artistsRelations = relations(artists, ({ many }) => ({
  artistTags: many(artistTags)
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  artistTags: many(artistTags)
}))

export const artistTagsRelations = relations(artistTags, ({ one }) => ({
  artist: one(artists, { fields: [artistTags.artistId], references: [artists.id] }),
  tag: one(tags, { fields: [artistTags.tagId], references: [tags.id] })
}))

export type Artist = typeof artists.$inferSelect
export type NewArtist = typeof artists.$inferInsert
