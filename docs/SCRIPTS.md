# Project Scripts Documentation

This document provides an overview of the available scripts in the Property Portal project.

## Root Scripts

These scripts can be run from the root of the project using `pnpm <script-name>`.

### Development

- `dev`: Run all packages in development mode
- `build`: Build all packages
- `start`: Start all packages in production mode
- `typecheck`: Run TypeScript type checking across all packages
- `clean`: Clean build artifacts across all packages

### Linting & Formatting

- `lint`: Run ESLint across all packages
- `lint:all`: Run ESLint on the entire codebase
- `lint:fix`: Run ESLint with auto-fix on the entire codebase
- `format`: Run Prettier with auto-fix on the entire codebase
- `format:check`: Check formatting without fixing
- `fix`: Run both Prettier and ESLint with auto-fix

### Testing

- `test`: Run tests across all packages
- `test:watch`: Run tests in watch mode
- `coverage`: Generate test coverage reports
- `test:ui`: Run tests with UI interface
- `cypress`: Open Cypress test runner
- `cypress:run`: Run Cypress tests headlessly

### Database

- `db:generate`: Generate Prisma client
- `db:migrate`: Run Prisma migrations in development
- `db:push`: Push schema changes to the database without migrations
- `db:studio`: Open Prisma Studio
- `db:seed`: Seed the database with test data
- `db:reset`: Reset the database (caution: destructive)
- `prisma:vector-index`: Set up vector indexes for similarity search

### Maintenance

- `cleanup:configs`: Remove duplicate config files
- `prepare`: Set up Husky git hooks

## Package-Specific Scripts

Each package (in `apps/` and `packages/`) has its own scripts that can be run using `pnpm --filter <package-name> <script-name>`.

### Web App (`apps/web`)

- `dev`: Run Next.js development server
- `build`: Build the Next.js app
- `start`: Start the Next.js app in production mode
- `typecheck`: Run TypeScript type checking
- `clean`: Clean build artifacts
- `test`: Run tests
- `test:watch`: Run tests in watch mode
- `test:coverage`: Generate test coverage report

### API (`apps/api`)

- `dev`: Run API development server
- `build`: Build the API
- `start`: Start the API in production mode
- `typecheck`: Run TypeScript type checking
- `clean`: Clean build artifacts
- `test`: Run tests
- `test:watch`: Run tests in watch mode

## Recommended Workflow

1. **Initial Setup**: 
   ```
   pnpm install
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

2. **Development**:
   ```
   pnpm dev
   ```

3. **Before Committing**:
   ```
   pnpm typecheck
   pnpm lint:fix
   pnpm format
   pnpm test
   ```

4. **Cleanup**:
   ```
   pnpm cleanup:configs
   pnpm clean
   ```

5. **Database Updates**:
   ```
   pnpm db:migrate
   pnpm db:generate
   pnpm prisma:vector-index
   ```