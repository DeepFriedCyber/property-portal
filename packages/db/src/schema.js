'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.apiTokens = exports.posts = exports.users = void 0
const pgCore = require('drizzle-orm/pg-core')
exports.users = (0, pgCore.pgTable)('users', {
  id: (0, pgCore.serial)('id').primaryKey(),
  fullName: (0, pgCore.text)('full_name'),
  email: (0, pgCore.varchar)('email', { length: 256 }).unique(),
  // ... other user fields
})
exports.posts = (0, pgCore.pgTable)('posts', {
  id: (0, pgCore.serial)('id').primaryKey(),
  title: (0, pgCore.varchar)('title', { length: 256 }).notNull(),
  content: (0, pgCore.text)('content'),
  authorId: (0, pgCore.integer)('author_id').references(() => exports.users.id),
  createdAt: (0, pgCore.timestamp)('created_at').defaultNow().notNull(),
  updatedAt: (0, pgCore.timestamp)('updated_at').defaultNow().notNull(),
})
exports.apiTokens = (0, pgCore.pgTable)('api_tokens', {
  id: (0, pgCore.serial)('id').primaryKey(),
  token: (0, pgCore.varchar)('token', { length: 256 }).unique().notNull(),
  userId: (0, pgCore.integer)('user_id')
    .notNull()
    .references(() => exports.users.id),
  expiresAt: (0, pgCore.timestamp)('expires_at'),
  createdAt: (0, pgCore.timestamp)('created_at').defaultNow().notNull(),
})
// Add all other tables here
