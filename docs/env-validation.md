# Environment Variables Validation

This project uses runtime validation for environment variables to ensure that all required variables are present and correctly formatted.

## How It Works

We use [Zod](https://github.com/colinhacks/zod) for schema validation and [@t3-oss/env-nextjs](https://github.com/t3-oss/env-nextjs) for Next.js integration.

### Web App (Next.js)

The environment schema is defined in `apps/web/src/env.mjs`:

```javascript
// Example of the schema
server: {
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // ...other server variables
},
client: {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  // ...other client variables
}
```

### API

The environment schema is defined in `apps/api/src/env.mjs`:

```javascript
// Example of the schema
const schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().positive().default(3001),
  // ...other variables
});
```

## Usage

### In Next.js Components

```javascript
import { env } from "@/src/env.mjs";

// Server-side (only in Server Components or API routes)
console.log(env.DATABASE_URL);
console.log(env.NEXTAUTH_SECRET);

// Client-side (safe to use anywhere)
console.log(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
```

### In API

```javascript
import { env } from "./env.mjs";

console.log(env.DATABASE_URL);
console.log(env.PORT);
```

## Required Environment Variables

See the `.env.example` file for a list of all required environment variables.

## Skipping Validation

In certain scenarios (like CI/CD pipelines), you might want to skip environment validation. You can do this by setting the `SKIP_ENV_VALIDATION` environment variable:

```bash
SKIP_ENV_VALIDATION=1 pnpm build
```