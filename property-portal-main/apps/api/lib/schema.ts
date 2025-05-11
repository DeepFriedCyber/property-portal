import { pgTable, serial, text, timestamp, boolean, integer, uuid, jsonb } from 'drizzle-orm/pg-core';

// Properties table
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  price: integer('price').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  squareFootage: integer('square_footage').notNull(),
  isFlagged: boolean('is_flagged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table (basic example)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Flagged properties table
export const flaggedProperties = pgTable('flagged_properties', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id),
  reason: text('reason').notNull(),
  status: text('status').default('pending').notNull(),
  raw_data: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// You can add more tables and relationships as needed