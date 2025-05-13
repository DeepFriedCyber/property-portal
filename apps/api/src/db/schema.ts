    import { pgTable, serial, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
    // If you have users table defined in @your-org/db and want to reference it (e.g., for foreign keys)
    // import { users as sharedUsers } from '@your-org/db/schema'; // Assuming schema is exported from @your-org/db

    export const posts = pgTable('posts', {
      id: serial('id').primaryKey(),
      title: varchar('title', { length: 256 }).notNull(),
      content: text('content'),
      authorId: integer('author_id'), // .references(() => sharedUsers.id), // Example FK
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull(),
    });

    export const apiTokens = pgTable('api_tokens', {
      id: serial('id').primaryKey(),
      token: varchar('token', { length: 256 }).unique().notNull(),
      userId: integer('user_id').notNull(), // .references(() => sharedUsers.id), // Example FK
      expiresAt: timestamp('expires_at'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
    });

    // Add other API-specific tables here