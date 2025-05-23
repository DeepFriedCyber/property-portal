# Setting Up GitHub Secrets

This document explains how to set up GitHub Secrets for the Property Portal project.

## Required Secrets

The following secrets need to be configured in your GitHub repository settings:

- `CLERK_SECRET_KEY`: Used for Clerk authentication
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth
- `NEXT_PUBLIC_MAPS_API_KEY`: Google Maps API key
- `REDIS_URL`: Redis connection string

## How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add each secret with its name and value
6. Click "Add secret"

## Obtaining Secret Values

### CLERK_SECRET_KEY

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Go to "API Keys"
4. Copy the "Secret Key"

### DATABASE_URL

This should be your PostgreSQL connection string in the format:

```
postgresql://username:password@hostname:port/database
```

### NEXTAUTH_SECRET

Generate a secure random string. You can use the following command:

```bash
openssl rand -base64 32
```

### NEXT_PUBLIC_MAPS_API_KEY

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Maps JavaScript API
4. Create an API key in the "Credentials" section

### REDIS_URL

This should be your Redis connection string in the format:

```
redis://username:password@hostname:port
```

For local development, it might be:

```
redis://localhost:6379
```

## Verifying Secrets

After setting up the secrets, you can verify they are working correctly by:

1. Triggering a GitHub Actions workflow
2. Checking the workflow logs to ensure no environment variable errors occur

## Security Considerations

- Never commit these secrets directly to your repository
- Rotate secrets periodically for better security
- Use secret scanning to detect accidental secret exposure
