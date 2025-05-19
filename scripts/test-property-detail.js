// @ts-check
/**
 * This script runs all tests related to the property detail page
 */

const { execSync } = require('child_process')
const path = require('path')

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

/**
 * Run a command and log the output
 * @param {string} command - The command to run
 * @param {string} label - A label for the command
 */
function runCommand(command, label) {
  console.warn(`\n${colors.bright}${colors.cyan}Running ${label}...${colors.reset}\n`)

  try {
    execSync(command, { stdio: 'inherit' })
    console.warn(`${colors.bright}${colors.green}✓ ${label} completed successfully${colors.reset}`)
    return true
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}✗ ${label} failed${colors.reset}\n`)
    return false
  }
}

// Main function to run all tests
async function runTests() {
  console.warn(
    `${colors.bright}${colors.yellow}=== Property Detail Page Test Suite ===${colors.reset}\n`
  )

  // Run unit tests
  const unitTestsSuccess = runCommand(
    'npx vitest run src/app/properties/\\[id\\]/*.test.tsx --reporter verbose',
    'Unit Tests'
  )

  // Run Cypress tests
  const e2eTestsSuccess = runCommand(
    'npx cypress run --spec "cypress/e2e/property-detail.cy.ts"',
    'End-to-End Tests'
  )

  // Summary
  console.warn(`\n${colors.bright}${colors.yellow}=== Test Summary ===${colors.reset}\n`)
  console.warn(
    `Unit Tests: ${unitTestsSuccess ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`
  )
  console.warn(
    `E2E Tests: ${e2eTestsSuccess ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`
  )

  if (unitTestsSuccess && e2eTestsSuccess) {
    console.warn(`\n${colors.bright}${colors.green}All tests passed successfully!${colors.reset}`)
    return 0
  } else {
    console.warn(
      `\n${colors.bright}${colors.red}Some tests failed. Please check the output above.${colors.reset}`
    )
    return 1
  }
}

// Run the tests
runTests().then(
  exitCode => process.exit(exitCode),
  error => {
    console.error(`${colors.bright}${colors.red}Error running tests:${colors.reset}`, error)
    process.exit(1)
  }
)
