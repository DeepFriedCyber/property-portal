# Property Portal

## Database Setup with Drizzle ORM

This project uses Drizzle ORM for database management. Follow these steps to set up and manage your database:

### Environment Setup

1. Copy the `.env.example` file to `.env` and update the `DATABASE_URL` with your database connection string:

```bash
cp .env.example .env
```

### Database Commands

The following commands are available for database management:

#### Generate Migrations

Generate SQL migrations based on your schema changes:

```bash
npm run db:generate
```

This will create migration files in the `./drizzle` directory.

#### Apply Migrations

Apply the generated migrations to your database:

```bash
npm run db:migrate
```

Or from the main project directory:

```bash
cd property-portal-main
npm run db:migrate
```

#### Push Schema Changes

Push schema changes directly to the database without generating migration files:

```bash
npm run db:push
```

#### Drizzle Studio

Launch Drizzle Studio to visually manage your database:

```bash
npm run db:studio
```

### Schema Management

The database schema is defined in `property-portal-main/apps/api/lib/schema.ts`. When you make changes to this file, you should generate and apply migrations to update your database structure.

## Project Structure

- `property-portal-main/apps/api/lib/schema.ts`: Database schema definition
- `property-portal-main/apps/api/lib/db.ts`: Database connection setup
- `drizzle.config.ts`: Drizzle CLI configuration
- `drizzle/`: Directory containing generated migrations