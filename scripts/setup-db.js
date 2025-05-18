// This script sets up the database by running migrations and generating the Prisma client
const { execSync } = require('child_process')
const path = require('path')

// Function to execute shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`)
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    console.error(`Error executing command: ${command}`)
    console.error(error)
    process.exit(1)
  }
}

// Main function
async function main() {
  console.log('Setting up the database...')

  // Generate Prisma client
  runCommand('npx prisma generate')

  // Create migrations from the schema
  runCommand('npx prisma migrate dev --name init')

  console.log('Database setup complete!')
}

// Run the main function
main().catch(error => {
  console.error('Error setting up the database:', error)
  process.exit(1)
})
