    import { pgTable, serial, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

    export const users = pgTable('users', {
      id: serial('id').primaryKey(),
      fullName: text('full_name'),
      email: varchar('email', { length: 256 }).unique(),
      // ... other user fields
    });

    export const posts = pgTable('posts', {
      id: serial('id').primaryKey(),
      title: varchar('title', { length: 256 }).notNull(),
      content: text('content'),
      authorId: integer('author_id').references(() => users.id),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull(),
    });

    export const apiTokens = pgTable('api_tokens', {
      id: serial('id').primaryKey(),
      token: varchar('token', { length: 256 }).unique().notNull(),
      userId: integer('user_id').notNull().references(() => users.id),
      expiresAt: timestamp('expires_at'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
    });

    // Add all other tables here