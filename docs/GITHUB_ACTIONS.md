# GitHub Actions Workflows

This document describes the GitHub Actions workflows used in the Property Portal project.

## Overview

The project uses GitHub Actions for continuous integration, deployment, and maintenance tasks. The workflows are defined in the `.github/workflows` directory.

## Workflows

### Environment Check

**File:** `.github/workflows/env-check.yml`

This is a reusable workflow that checks for the presence of required environment variables. It's called by other workflows to ensure all necessary secrets are configured before running the main tasks. It checks for:

- Authentication secrets (NEXTAUTH_SECRET, CLERK keys)
- Database connection strings
- Other required configuration

If any required secrets are missing, the workflow fails with a clear error message.


### CI (Continuous Integration)

**File:** `.github/workflows/ci.yml`

This workflow runs on every push to the `main` and `develop` branches, as well as on pull requests to these branches. It performs the following tasks:

- Sets up Node.js, pnpm, and caches
- Installs dependencies
- Sets up a PostgreSQL database and Redis for testing
- Runs type checking
- Runs linting
- Runs unit tests with coverage reporting
- Builds the application
- Runs end-to-end tests
- Uploads test artifacts if any tests fail

### Deploy

**File:** `.github/workflows/deploy.yml`

This workflow runs on every push to the `main` branch and can also be triggered manually. It's split into three jobs:

1. **Build Job:**
   - Sets up Node.js, pnpm, and caches (both pnpm and Next.js caches)
   - Installs production dependencies only
   - Generates the Prisma client
   - Builds and exports the web application
   - Creates necessary files (CNAME, 404.html)
   - Uploads the build as a GitHub Pages artifact

2. **Deploy Job:**
   - Deploys the built application to GitHub Pages
   - Uses the official GitHub Pages deployment action

3. **Verify Job:**
   - Runs after deployment is complete
   - Waits for the deployment to propagate
   - Checks if the deployed site is accessible
   - Runs basic smoke tests to verify functionality

### Dependency Updates

**File:** `.github/workflows/dependency-updates.yml`

This workflow runs every Monday at midnight and can also be triggered manually. It performs the following tasks:

- Updates all dependencies to their latest versions
- Creates a new branch with the updates
- Creates a pull request for the updates
- Checks for vulnerabilities in the updated dependencies

### Security Scan

**File:** `.github/workflows/security.yml`

This workflow runs on every push to the `main` branch, on pull requests to the `main` branch, and weekly on Mondays. It performs the following tasks:

- Runs Trivy vulnerability scanner to check for vulnerabilities in the codebase
- Uploads the scan results in SARIF format for GitHub security analysis
- Runs npm audit to check for vulnerabilities in dependencies
- Performs a license check on all dependencies

### Storybook Deployment

**File:** `.github/workflows/storybook.yml`

This workflow runs on every push to the `main` branch that changes files in the `packages/ui` directory and can also be triggered manually. It performs the following tasks:

- Builds the Storybook for the UI package
- Deploys the built Storybook to the `storybook-pages` branch

### Release

**File:** `.github/workflows/release.yml`

This workflow runs when a new tag with the format `v*` (e.g., `v1.0.0`) is pushed to the repository. It performs the following tasks:

- Builds the application
- Creates a GitHub release with automatically generated release notes
- Attaches the built application files to the release

## Secrets

The workflows use the following GitHub secrets:

### Authentication
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Publishable key for Clerk
- `CLERK_SECRET_KEY`: Secret key for Clerk

### Database
- `DATABASE_URL`: URL for the development/test database
- `DATABASE_URL_PROD`: URL for the production database
- `REDIS_URL`: URL for Redis

### API Keys
- `NEXT_PUBLIC_MAPS_API_KEY`: API key for maps

### Monitoring
- `SENTRY_DSN`: Data Source Name for Sentry error tracking
- `CODECOV_TOKEN`: Token for Codecov coverage reporting
- `SNYK_TOKEN`: Token for Snyk vulnerability scanning

## Manual Triggering

Most workflows can be triggered manually from the GitHub Actions tab in the repository. This is useful for testing the workflows or running them outside of their scheduled times.

## Workflow Concurrency

All workflows use concurrency groups to ensure that only one instance of each workflow runs at a time for a given branch or pull request. This prevents race conditions and saves resources.

## Caching

The workflows use caching for:

- pnpm store
- Turbo cache

This speeds up the workflows by reusing previously downloaded dependencies and build artifacts.

## Testing

The CI workflow runs:

- Unit tests
- Integration tests
- End-to-end tests

Test results and coverage reports are uploaded as artifacts and to Codecov.

## Deployment

The project is deployed to:

- GitHub Pages for the web application
- GitHub Pages for the Storybook (in a subdirectory)
- GitHub Releases for versioned releases

## Troubleshooting

If a workflow fails, check the following:

1. Are all required secrets set in the repository settings?
2. Are there any errors in the workflow logs?
3. Are the dependencies up to date?
4. Are there any failing tests?
5. Are there any linting errors?
6. Are there any type errors?

If you need to debug a workflow, you can add the following step to the workflow:

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: ${{ failure() }}
```

This will create a SSH session that you can connect to for debugging.