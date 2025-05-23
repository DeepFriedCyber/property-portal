/**
 * Security check script
 *
 * This script:
 * 1. Runs npm audit to check for vulnerable dependencies
 * 2. Checks for missing environment variables
 * 3. Validates security headers in middleware
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const dotenv = require('dotenv')

// Required environment variables
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'OLLAMA_API_KEY',
  'EMBEDDING_SERVICE_URL',
]

// Security headers that should be present in middleware
const REQUIRED_SECURITY_HEADERS = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Permissions-Policy',
  'Strict-Transport-Security',
  'Referrer-Policy',
]

function checkDependencies() {
  console.log('\n🔍 Checking dependencies for vulnerabilities...')
  try {
    execSync('npm audit --production', { stdio: 'inherit' })
    console.log('✅ Dependency check completed')
  } catch (error) {
    console.error('⚠️ Vulnerabilities found in dependencies')
    // Continue with the script even if vulnerabilities are found
  }
}

function checkEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...')

  // Load .env file if it exists
  const envPath = path.resolve(process.cwd(), '.env')
  let envVars = {}

  if (fs.existsSync(envPath)) {
    envVars = dotenv.parse(fs.readFileSync(envPath))
    console.log('📄 Found .env file')
  } else {
    console.warn('⚠️ No .env file found. Checking environment variables from process.env')
    envVars = process.env
  }

  // Check for missing required variables
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !envVars[varName])

  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are set')
  } else {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.log('\nPlease add these variables to your .env file')
  }
}

function checkSecurityHeaders() {
  console.log('\n🔍 Checking security headers in middleware...')

  const middlewarePath = path.resolve(process.cwd(), 'middleware.ts')

  if (!fs.existsSync(middlewarePath)) {
    console.error('❌ middleware.ts file not found')
    return
  }

  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')

  // Check for each required header
  const missingHeaders = REQUIRED_SECURITY_HEADERS.filter(
    header => !middlewareContent.includes(header)
  )

  if (missingHeaders.length === 0) {
    console.log('✅ All required security headers are configured in middleware')
  } else {
    console.error('❌ Missing security headers in middleware:')
    missingHeaders.forEach(header => {
      console.error(`   - ${header}`)
    })
  }
}

function checkRateLimiting() {
  console.log('\n🔍 Checking rate limiting implementation...')

  const rateLimitPath = path.resolve(process.cwd(), 'lib/rate-limit.ts')

  if (!fs.existsSync(rateLimitPath)) {
    console.error('❌ lib/rate-limit.ts file not found')
    return
  }

  console.log('✅ Rate limiting implementation found')

  // Check API routes for rate limiting
  const apiDir = path.resolve(process.cwd(), 'app/api')
  if (fs.existsSync(apiDir)) {
    const apiRoutes = findApiRoutes(apiDir)
    const routesWithRateLimit = apiRoutes.filter(route => {
      const content = fs.readFileSync(route, 'utf8')
      return content.includes('withRateLimit') || content.includes('rateLimit')
    })

    console.log(
      `📊 ${routesWithRateLimit.length} of ${apiRoutes.length} API routes have rate limiting`
    )

    if (routesWithRateLimit.length < apiRoutes.length) {
      console.warn('⚠️ Some API routes do not have rate limiting:')
      apiRoutes.forEach(route => {
        const content = fs.readFileSync(route, 'utf8')
        if (!content.includes('withRateLimit') && !content.includes('rateLimit')) {
          console.warn(`   - ${route.replace(process.cwd(), '')}`)
        }
      })
    }
  }
}

function findApiRoutes(dir, routes = []) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findApiRoutes(filePath, routes)
    } else if (file === 'route.ts' || file === 'route.js') {
      routes.push(filePath)
    }
  })

  return routes
}

// Run all checks
function runSecurityChecks() {
  console.log('🔒 Running security checks...')

  checkDependencies()
  checkEnvironmentVariables()
  checkSecurityHeaders()
  checkRateLimiting()

  console.log('\n🔒 Security check completed')
}

runSecurityChecks()
