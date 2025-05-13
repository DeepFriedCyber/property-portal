import { pgTable, text, uuid, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const uploadRecord = pgTable('upload_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploaderId: text('uploader_id'),
  filename: text('filename'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow()
});

export const property = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadId: uuid('upload_id'),
  address: text('address'),
  price: integer('price'),
  bedrooms: integer('bedrooms'),
  type: text('type'),
  dateSold: timestamp('date_sold'),
  embedding: jsonb('embedding').$type<number[]>()
});