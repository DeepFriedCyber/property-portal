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

1. Copy the `.env.example` file to `.env` and update the environment variables with your actual values:

```bash
cp .env.example .env
```

2. Update the following required environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for local development)

> **Security Note**: Never commit your `.env` file to version control. It contains sensitive information like API keys and database credentials. The `.gitignore` file is configured to exclude `.env` files.

2. Navigate to the web app directory and start the development server:

```bash
cd apps/web
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## GitHub Pages Deployment

This project is configured for deployment to GitHub Pages. The deployment is handled automatically through GitHub Actions when you push to the main branch.

### Manual Deployment

If you want to deploy manually:

1. Build the project for production:

```bash
cd apps/web
npm run build:static
```

2. The static files will be generated in the `apps/web/out` directory.

3. Deploy to GitHub Pages using the GitHub Actions workflow or manually by pushing the `out` directory to the `gh-pages` branch.

### Configuration

The GitHub Pages deployment is configured with:

- Base path: `/property-portal`
- Custom 404 page for SPA routing
- GitHub Actions workflow for automated deployment

### Environment Variables for GitHub Pages

For GitHub Pages deployment, you'll need to set the following secrets in your GitHub repository:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key

These will be used by the GitHub Actions workflow to build the application with the correct environment variables.
