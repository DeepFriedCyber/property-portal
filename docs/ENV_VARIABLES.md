# Environment Variables Best Practices

This document outlines best practices for managing environment variables in the Property Portal project.

## Overview

Environment variables are used to configure the application for different environments (development, testing, production) and to store sensitive information like API keys and secrets.

## Environment Variable Types

### Client-Side Variables

These variables are exposed to the browser and should **never** contain sensitive information.

- Must be prefixed with `NEXT_PUBLIC_`
- Examples: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Server-Side Variables

These variables are only available on the server and can contain sensitive information.

- Never prefixed with `NEXT_PUBLIC_`
- Examples: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXTAUTH_SECRET`

## Required Environment Variables

The following environment variables are required for the application to function properly:

### Authentication

- `NEXTAUTH_SECRET`: Secret for NextAuth.js (min 32 characters)
- `NEXTAUTH_URL`: URL for NextAuth.js (in production)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Publishable key for Clerk
- `CLERK_SECRET_KEY`: Secret key for Clerk

### Database

- `DATABASE_URL`: URL for the development/test database
- `DATABASE_URL_PROD`: URL for the production database (used in deployment)

### API Keys

- `NEXT_PUBLIC_MAPS_API_KEY`: API key for maps integration

### Feature Flags and Configuration

- `NEXT_PUBLIC_ENVIRONMENT`: Current environment (development, test, production)
- `NEXT_PUBLIC_APP_URL`: Base URL of the application

## Environment Files

We use different environment files for different environments:

- `.env`: Default environment variables (committed to git with placeholder values)
- `.env.local`: Local overrides (not committed to git)
- `.env.development`: Development environment variables
- `.env.test`: Test environment variables
- `.env.production`: Production environment variables

## Environment Validation

We use runtime validation for environment variables to ensure that all required variables are present and correctly formatted. This is implemented using:

- [Zod](https://github.com/colinhacks/zod) for schema validation
- [@t3-oss/env-nextjs](https://github.com/t3-oss/env-nextjs) for Next.js integration

The validation schema is defined in:
- `apps/web/src/env.mjs` for the Next.js app
- `apps/api/src/env.mjs` for the API

## CI/CD Integration

Our GitHub Actions workflows include an environment check step that verifies all required secrets are available before running the main workflow tasks. This helps catch configuration issues early.

See `.github/workflows/env-check.yml` for implementation details.

## Best Practices

1. **Never commit sensitive values to git**
   - Use `.env.local` for local development
   - Use GitHub Secrets for CI/CD

2. **Use different values for different environments**
   - Development: Local or test services
   - Production: Production services with proper security

3. **Validate environment variables at runtime**
   - Fail fast if required variables are missing
   - Provide clear error messages

4. **Document all environment variables**
   - Keep this document updated
   - Include example values in `.env.example`

5. **Use type-safe access**
   - Import from the environment validation module
   - Benefit from autocompletion and type checking

## Example Usage

### In Next.js Components

```typescript
// Client component
import { env } from '@/src/env.mjs';

// Safe to use in client components
console.log(env.NEXT_PUBLIC_APP_URL);
```

```typescript
// Server component
import { env } from '@/src/env.mjs';

// Only available in Server Components or API routes
console.log(env.DATABASE_URL);
```

### In API

```typescript
import { env } from './env.mjs';

console.log(env.DATABASE_URL);
```