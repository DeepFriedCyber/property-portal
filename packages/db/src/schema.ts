import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email', { length: 256 }).unique(),
  // ... other user fields
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const apiTokens = pgTable('api_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 256 }).unique().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Property schema from drizzle/schema.ts
export const property = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadId: uuid('upload_id'),
  address: text('address'),
  price: integer('price'),
  bedrooms: integer('bedrooms'),
  type: text('type'),
  dateSold: timestamp('date_sold'),
  embedding: jsonb('embedding').$type<number[]>(),
  // Add these fields to match the test expectations
  title: text('title'),
  location: text('location'),
  bathrooms: integer('bathrooms'),
  area: integer('area'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  description: text('description'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// Uploads table for tracking CSV uploads
export const uploads = pgTable('uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  filename: text('filename').notNull(),
  status: text('status').notNull(), // processing, complete, failed, etc.
  totalProperties: integer('total_properties').default(0),
  invalidProperties: integer('invalid_properties').default(0),
  processingStats: jsonb('processing_stats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Add all other tables here
