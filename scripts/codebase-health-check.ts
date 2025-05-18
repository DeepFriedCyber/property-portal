import { exec as execCallback } from 'child_process'
import * as util from 'util'

// Use console for this script since we can't find the logger
// We'll look for console statements in other files, not this one
const exec = util.promisify(execCallback)

// Patterns to search for
const PATTERNS = [
  {
    name: 'Console statements',
    regex: /console\.(log|error|warn|info|debug)/g,
    command:
      'grep -r "console\\." --include="*.{ts,tsx,js,jsx}" . --exclude-dir={node_modules,.next,dist,build,coverage,.git,drizzle}',
    severity: 'warning',
  },
  {
    name: 'Any type',
    regex: /: any(\s|\)|\]|;|,)/g,
    command:
      'grep -r ": any" --include="*.{ts,tsx}" . --exclude-dir={node_modules,.next,dist,build,coverage,.git,drizzle}',
    severity: 'warning',
  },
  {
    name: 'Explicit null checks',
    regex: /([a-zA-Z0-9_]+)\s*===\s*null|\s*null\s*===\s*([a-zA-Z0-9_]+)/g,
    command:
      'grep -r "=== null\\|null ===" --include="*.{ts,tsx,js,jsx}" . --exclude-dir={node_modules,.next,dist,build,coverage,.git,drizzle}',
    severity: 'info',
  },
  {
    name: 'Direct error string concatenation',
    regex: /\+\s*error|\+\s*err|error\s*\+|err\s*\+/g,
    command:
      'grep -r "\\+ error\\|error \\+" --include="*.{ts,tsx,js,jsx}" . --exclude-dir={node_modules,.next,dist,build,coverage,.git,drizzle}',
    severity: 'warning',
  },
  {
    name: 'TODO comments',
    regex: /\/\/\s*TODO|\/\*\s*TODO/g,
    command:
      'grep -r "TODO" --include="*.{ts,tsx,js,jsx}" . --exclude-dir={node_modules,.next,dist,build,coverage,.git,drizzle}',
    severity: 'info',
  },
]

// Define types for better type safety
interface ExecError extends Error {
  code?: number
  stdout?: string
}

interface EslintResult {
  errorCount: number
  warningCount: number
  filePath: string
}

async function runHealthCheck() {
  console.info('Starting codebase health check...')

  const results: Record<string, { count: number; files: string[] }> = {}

  // Run checks in parallel
  await Promise.all(
    PATTERNS.map(async pattern => {
      try {
        const { stdout } = await exec(pattern.command)
        const lines = stdout.split('\n').filter(Boolean)

        results[pattern.name] = {
          count: lines.length,
          files: lines.map(line => line.split(':')[0]).filter((v, i, a) => a.indexOf(v) === i),
        }

        console.info(`Found ${lines.length} instances of ${pattern.name}`, {
          severity: pattern.severity,
          fileCount: results[pattern.name].files.length,
        })

        if (lines.length > 0 && lines.length <= 10) {
          console.info(`Sample occurrences of ${pattern.name}:`, {
            samples: lines.slice(0, 5),
          })
        }
      } catch (error) {
        // grep returns non-zero exit code when no matches are found
        const execError = error as ExecError
        if (execError.code === 1 && execError.stdout === '') {
          results[pattern.name] = { count: 0, files: [] }
          console.info(`No instances of ${pattern.name} found`, { severity: pattern.severity })
        } else {
          console.error(
            `Error checking for ${pattern.name}`,
            error instanceof Error ? error : new Error(String(error))
          )
        }
      }
    })
  )

  // Run ESLint check
  try {
    console.info('Running ESLint check...')
    const { stdout } = await exec('npx eslint --ext .ts,.tsx,.js,.jsx . --format json')

    // Parse ESLint JSON output
    const eslintResults = JSON.parse(stdout) as EslintResult[]
    const errorCount = eslintResults.reduce((sum: number, file) => sum + file.errorCount, 0)
    const warningCount = eslintResults.reduce((sum: number, file) => sum + file.warningCount, 0)

    console.info('ESLint check completed', {
      errorCount,
      warningCount,
      filesWithIssues: eslintResults.filter(file => file.errorCount > 0 || file.warningCount > 0)
        .length,
    })
  } catch (error) {
    console.error(
      'Error running ESLint check',
      error instanceof Error ? error : new Error(String(error))
    )
  }

  // Summary
  console.info('Health check summary', {
    results: Object.entries(results).map(([name, data]) => ({
      name,
      count: data.count,
      fileCount: data.files.length,
    })),
  })
}

runHealthCheck().catch(error => {
  console.error('Health check failed', error instanceof Error ? error : new Error(String(error)))
  process.exit(1)
})
