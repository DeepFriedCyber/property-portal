const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true })
}

// Create a simple package.json if it doesn't exist
const packageJsonPath = path.join(__dirname, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  const packageJson = {
    name: '@property-portal/hooks',
    version: '1.0.0',
    private: true,
    dependencies: {
      leaflet: '^1.9.4',
    },
    devDependencies: {
      eslint: '^8.57.1',
    },
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

// Create a symlink for ESLint
const eslintPath = path.join(__dirname, '..', 'node_modules', 'eslint')
const localEslintPath = path.join(nodeModulesPath, 'eslint')

if (fs.existsSync(eslintPath) && !fs.existsSync(localEslintPath)) {
  try {
    // On Windows, we need to use junction instead of symlink for directories
    fs.symlinkSync(eslintPath, localEslintPath, 'junction')
    console.log('ESLint symlink created successfully')
  } catch (error) {
    console.error('Error creating symlink:', error)
  }
}

console.log('Setup complete')
