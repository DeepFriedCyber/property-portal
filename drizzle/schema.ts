import { pgTable, text, uuid, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const uploadRecord = pgTable('upload_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploaderId: text('uploader_id'),
  filename: text('filename'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow()
});

export const uploads = pgTable('uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  filename: text('filename'),
  originalName: text('original_name'),
  mimeType: text('mime_type'),
  size: integer('size'),
  status: text('status').default('pending'),
  processingErrors: jsonb('processing_errors').$type<string[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const property = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadId: uuid('upload_id'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  price: integer('price'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  squareFeet: integer('square_feet'),
  description: text('description'),
  features: jsonb('features').$type<string[]>(),
  status: text('status').default('available'),
  type: text('type'),
  dateSold: timestamp('date_sold'),
  embedding: jsonb('embedding').$type<number[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by')
});