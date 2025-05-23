# Database Schema Documentation

## Overview

This document outlines the database schema for the Property Portal application, including performance optimizations and best practices.

## Models

### Property

The main model for property listings with the following performance optimizations:

- **Indexes**:
  - `[lat, lng]`: Optimizes geospatial queries
  - `[price]`: Improves filtering and sorting by price
  - `[createdAt]`: Enhances performance for recent listings
  - `[bedrooms, bathrooms]`: Speeds up common filtering operations
  - `[location]`: Optimizes searches by location

- **Vector Search**:
  - Uses `pgvector` extension for similarity searches
  - Implements an IVFFlat index for efficient vector similarity searches

### User

Stores user information with Clerk integration.

### Favorite

Manages user favorites with proper cascading deletes.

## Vector Search Setup

The application uses PostgreSQL's pgvector extension for similarity searches. The setup includes:

1. Extension configuration in the Prisma schema
2. Custom IVFFlat index for optimized performance
3. Proper embedding storage using the vector type

## How to Apply Changes

After making changes to the schema:

1. Run migrations: `pnpm prisma:migrate`
2. Set up vector index: `pnpm prisma:vector-index`
3. Generate Prisma client: `pnpm prisma:generate`

## Performance Considerations

- The IVFFlat index significantly improves vector search performance
- Database indexes are added for the most common query patterns
- Cascading deletes ensure data integrity