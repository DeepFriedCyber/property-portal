# Property Embeddings Integration

This document explains how vector embeddings are integrated into the property portal for semantic search and similarity features.

## Overview

The property portal uses vector embeddings to enable:

1. Semantic search for properties (finding properties based on meaning, not just keywords)
2. Similar property recommendations
3. Property clustering and categorization

## Architecture

The system consists of two main components:

1. **Embedding Microservice**: A Python FastAPI service that converts text to vector embeddings
2. **Next.js Integration**: API routes and utilities to work with embeddings in the main application

## Embedding Microservice

The embedding service is a separate Python application located in the `embedding_server` directory. It uses the `sentence-transformers` library with the `all-MiniLM-L6-v2` model to convert text into 384-dimensional vectors.

### Running the Service

```bash
cd embedding_server
docker-compose up -d
```

The service will be available at http://localhost:5000.

## Database Integration

The property database uses PostgreSQL with the `pgvector` extension to store and query vector embeddings efficiently.

### Schema

The `Property` model in the Prisma schema includes an `embedding` field:

```prisma
model Property {
  // other fields...
  embedding Float[] @db.Vector // Vector embedding for similarity search
}
```

## API Routes

### Generate Embeddings

- `POST /api/embeddings`: Generates embeddings for property data
- Request body: Property data (title, location, description)
- Response: Generated embedding vector

### Create Property with Embedding

- `POST /api/properties`: Creates a new property with automatically generated embedding
- Request body: Property data
- Response: Created property with embedding

### Find Similar Properties

- `GET /api/properties/similar?query=...`: Finds properties similar to a text query
- `POST /api/properties/similar`: Finds properties similar to an existing property

## Usage in Frontend

### Example: Finding Similar Properties

```typescript
// Find properties similar to a text query
async function findSimilarProperties(query: string, limit = 3) {
  const response = await fetch(
    `/api/properties/similar?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  const data = await response.json();
  return data.properties;
}

// Find properties similar to an existing property
async function findSimilarToProperty(propertyId: string, limit = 3) {
  const response = await fetch('/api/properties/similar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ propertyId, limit }),
  });
  const data = await response.json();
  return data.properties;
}
```

## Maintenance

### Updating Embeddings

When property data changes significantly, you should update its embedding:

```typescript
async function updatePropertyEmbedding(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  
  if (!property) return null;
  
  const embedding = await generatePropertyEmbedding({
    title: property.title,
    location: property.location,
    description: property.description,
  });
  
  return prisma.property.update({
    where: { id: propertyId },
    data: { embedding },
  });
}
```