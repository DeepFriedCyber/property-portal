# Environment Variables

This project uses type-safe environment variables with `@t3-oss/env-nextjs` and Zod.

## Overview

The `env.ts` file provides a type-safe way to access environment variables in both server and client-side code. It validates that all required environment variables are present and correctly formatted at build time.

## Usage

### Server-side

```typescript
import { env } from '@/lib/env'

// Access server-side environment variables
const dbUrl = env.DATABASE_URL
const authSecret = env.NEXTAUTH_SECRET
const redisUrl = env.REDIS_URL // Optional
```

### Client-side

```typescript
import { env } from '@/lib/env'

// Access client-side environment variables
const mapsApiKey = env.NEXT_PUBLIC_MAPS_API_KEY
```

## Required Environment Variables

| Variable                 | Description                           | Required | Side   |
| ------------------------ | ------------------------------------- | -------- | ------ |
| DATABASE_URL             | PostgreSQL connection string          | Yes      | Server |
| NEXTAUTH_SECRET          | Secret for NextAuth.js authentication | Yes      | Server |
| NEXT_PUBLIC_MAPS_API_KEY | Google Maps API key                   | Yes      | Client |
| REDIS_URL                | Redis connection string for caching   | No       | Server |

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in the required values
3. For production, set these environment variables in your hosting platform

## Validation

Environment variables are validated at build time using Zod schemas. If any required variables are missing or incorrectly formatted, the build will fail with a helpful error message.
