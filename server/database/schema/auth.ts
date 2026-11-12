import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const ROLES = ['ADMIN', 'EDITOR', 'USER'] as const
export type Role = typeof ROLES[number]

export const LANGUAGES = ['hu', 'en'] as const
export type Language = typeof LANGUAGES[number]

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`).$onUpdate(() => new Date())
}

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  nickname: text('nickname'),
  location: text('location'),
  language: text('language', { enum: LANGUAGES }).$type<Language>().notNull().default('hu'),
  role: text('role', { enum: ROLES }).$type<Role>().notNull().default('USER'),
  banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
  ...timestamps
}, t => [uniqueIndex('user_email_uq').on(t.email)])

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
  ...timestamps
}, t => [uniqueIndex('session_token_uq').on(t.token), index('session_user_idx').on(t.userId)])

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  ...timestamps
}, t => [index('account_user_idx').on(t.userId)])

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  ...timestamps
}, t => [index('verification_identifier_idx').on(t.identifier)])

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account)
}))
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] })
}))
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}))
