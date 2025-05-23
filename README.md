# Property Portal [![CI](https://github.com/DeepFriedCyber/property-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/DeepFriedCyber/property-portal/actions/workflows/ci.yml) [![Deploy](https://github.com/DeepFriedCyber/property-portal/actions/workflows/deploy.yml/badge.svg)](https://github.com/DeepFriedCyber/property-portal/actions/workflows/deploy.yml) [![Security](https://github.com/DeepFriedCyber/property-portal/actions/workflows/security.yml/badge.svg)](https://github.com/DeepFriedCyber/property-portal/actions/workflows/security.yml)

This monorepo contains the frontend and backend services for the Property Portal.

## Project Structure

- `apps/web`: Contains the Next.js frontend application for users.
- `apps/api`: Contains the backend API services (e.g., built with Express/NestJS or Next.js API routes).
- `packages/ui`: Shared UI components used by `apps/web` and potentially other frontends.
- `packages/db`: Shared database client and schema definitions.
- `packages/utils`: (Example) Shared utility functions.

## CI/CD Workflows

This project uses GitHub Actions for continuous integration and deployment:

- **CI**: Runs tests, linting, and type checking on every pull request and push to main
- **Deploy**: Deploys the application to GitHub Pages on push to main
- **Security**: Runs security scans to identify vulnerabilities
- **Release**: Creates GitHub releases when a new version tag is pushed
- **Dependency Updates**: Automatically updates dependencies weekly

For more details on the workflows, see [docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md).

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

## Deployment

This project is configured for automated deployment through GitHub Actions.

### GitHub Pages Deployment

The application is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment process includes:

1. Environment variable validation
2. Building the application
3. Deploying to GitHub Pages
4. Post-deployment verification

You can view the deployment status in the [Actions tab](https://github.com/DeepFriedCyber/property-portal/actions/workflows/deploy.yml).

### Release Process

To create a new release:

1. Tag the commit you want to release:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. The release workflow will automatically:
   - Build the application
   - Create a GitHub release with release notes
   - Attach the built files to the release

### Manual Deployment

If you want to deploy manually:

1. Build the project for production:
   ```bash
   cd apps/web
   pnpm build
   pnpm export
   ```

2. The static files will be generated in the `apps/web/out` directory.

### Configuration

The deployment is configured with:

- Base path: `/property-portal`
- Custom domain: `property-portal.example.com` (configurable)
- Custom 404 page for SPA routing
- Automated verification checks

### Environment Variables

For deployment, you'll need to set the following secrets in your GitHub repository:

#### Required Secrets
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `DATABASE_URL`: Development database URL
- `DATABASE_URL_PROD`: Production database URL
- `NEXTAUTH_SECRET`: NextAuth secret key

#### Optional Secrets
- `NEXT_PUBLIC_MAPS_API_KEY`: Google Maps API key
- `REDIS_URL`: Redis connection string
- `SENTRY_DSN`: Sentry error tracking DSN
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `DISCORD_WEBHOOK_URL`: Alternative notifications

For detailed instructions on environment variables, see [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md).
