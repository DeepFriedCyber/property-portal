# Security Documentation

This document outlines the security measures implemented in the Property Portal application.

## API Security

### Rate Limiting

Rate limiting has been implemented to protect API endpoints from abuse and denial-of-service attacks. The implementation uses an in-memory store for development, but should be replaced with a distributed cache like Redis in production.

#### Configuration

Rate limits are configured per endpoint based on their sensitivity and expected usage patterns:

- **Search API**: 20 requests per minute
- **Upload API**: 5 requests per minute

#### Implementation

Rate limiting is implemented in `lib/rate-limit.ts` and applied to API routes using the `withRateLimit` higher-order function:

```typescript
export const POST = withRateLimit(handler, {
  limit: 20,
  interval: 60, // 60 seconds
})
```

### Security Headers

Security headers are added to all responses via the Next.js middleware in `middleware.ts`:

- **Content-Security-Policy**: Restricts which resources can be loaded
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS protection
- **Permissions-Policy**: Restricts browser features
- **Strict-Transport-Security**: Enforces HTTPS
- **Referrer-Policy**: Controls referrer information

## Authentication

The application uses Clerk for authentication, which provides:

- Secure user management
- Multi-factor authentication
- Session management
- CSRF protection

## Environment Variables

Sensitive configuration is stored in environment variables. The `.env.example` file provides a template with all required variables:

- Database credentials
- API keys
- Authentication secrets
- Service endpoints

### Required Environment Variables

The following environment variables are required for the application to function securely:

- `DATABASE_URL`: PostgreSQL connection string
- `POOL_SIZE`: Database connection pool size
- `CLERK_SECRET_KEY`: Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `OLLAMA_API_KEY`: API key for Ollama LLM service
- `OLLAMA_MODEL`: Model to use for embeddings and text generation

## Data Protection

### Database Security

- Connection pooling limits the number of open database connections
- SSL is enabled for database connections
- Parameterized queries prevent SQL injection

### Input Validation

All user inputs are validated before processing:

- Search queries must be at least 2 characters
- File uploads are validated for type and size
- Request bodies are validated against schemas

## Monitoring and Logging

Security events are logged for monitoring and auditing:

- Failed authentication attempts
- Rate limit violations
- API errors
- Database connection issues

## Future Improvements

Planned security enhancements:

1. Implement Redis-based rate limiting for production
2. Add API key authentication for external services
3. Implement request signing for sensitive operations
4. Set up automated security scanning in CI/CD pipeline
5. Implement IP-based blocking for repeated abuse
