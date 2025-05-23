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

To get the Property Portal running:

1. Copy the `.env.example` file to `.env` and update the environment variables with your actual values:

```bash
cp .env.example .env
```

2. Set up the required environment variables as detailed in the [Environment Configuration](#environment-configuration) section below.

> **Security Note**: Never commit your `.env` file to version control. It contains sensitive information like API keys and database credentials. The `.gitignore` file is configured to exclude `.env` files.

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Configuration

The Property Portal requires several environment variables to function properly. These are organized into categories in the `.env.example` file. Below is a detailed explanation of each required variable:

### Database Configuration

- `DATABASE_URL`: PostgreSQL connection string with pgvector extension support
  - Format: `postgresql://username:password@hostname:port/database`
  - Example: `postgresql://postgres:password@localhost:5432/property_portal`
  - **Note**: The database must have the pgvector extension installed for property similarity search

### Authentication

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (starts with pk_test_ or pk_live_)
- `CLERK_SECRET_KEY`: Your Clerk secret key (starts with sk_test_ or sk_live_)
- Clerk redirect URLs (customize as needed):
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Path for sign-in page
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Path for sign-up page
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Redirect path after sign-in
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Redirect path after sign-up

### AI & Embeddings

- `EMBEDDING_SERVICE_URL`: URL for the embedding service that generates vector embeddings
  - Default: `http://localhost:8000` if not specified
  - This service is used for property similarity search

### Maps & Location Services

Choose ONE of the following map providers:

- Google Maps:
  - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

- OR Mapbox:
  - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox access token

- OR MapTiler:
  - `NEXT_PUBLIC_MAPTILER_KEY`: Your MapTiler API key (client-side)
  - `MAPTILER_API_KEY`: Your MapTiler API key (server-side)

### Payment Processing (if using payments)

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret for verifying webhook events

### Image Storage

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Application Settings

- `NEXT_PUBLIC_APP_URL`: Public URL of your application (used for API calls and redirects)
  - Local development: `http://localhost:3000`
  - Production: Your deployed URL
- `NODE_ENV`: Environment setting (`development`, `test`, or `production`)

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
