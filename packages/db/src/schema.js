'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.apiTokens = exports.posts = exports.users = void 0;
const pg_core_1 = require('drizzle-orm/pg-core');
exports.users = (0, pg_core_1.pgTable)('users', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  fullName: (0, pg_core_1.text)('full_name'),
  email: (0, pg_core_1.varchar)('email', { length: 256 }).unique(),
  // ... other user fields
});
exports.posts = (0, pg_core_1.pgTable)('posts', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  title: (0, pg_core_1.varchar)('title', { length: 256 }).notNull(),
  content: (0, pg_core_1.text)('content'),
  authorId: (0, pg_core_1.integer)('author_id').references(() => exports.users.id),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.apiTokens = (0, pg_core_1.pgTable)('api_tokens', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  token: (0, pg_core_1.varchar)('token', { length: 256 }).unique().notNull(),
  userId: (0, pg_core_1.integer)('user_id')
    .notNull()
    .references(() => exports.users.id),
  expiresAt: (0, pg_core_1.timestamp)('expires_at'),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Add all other tables here
