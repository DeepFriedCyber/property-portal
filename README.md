# Property Portal Project

This monorepo contains the frontend and backend services for the Property Portal.

## Project Structure

- `apps/web`: Contains the Next.js frontend application for users.
- `apps/api`: Contains the backend API services (e.g., built with Express/NestJS or Next.js API routes).
- `packages/ui`: Shared UI components used by `apps/web` and potentially other frontends.
- `packages/db`: Shared database client and schema definitions.
- `packages/utils`: (Example) Shared utility functions.

## Getting Started

To get the `apps/web` frontend running:

1. Copy the `.env.example` file to `.env` and update the `DATABASE_URL` with your database connection string:

```bash
cp .env.example .env
```
