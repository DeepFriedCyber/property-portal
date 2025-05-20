module.exports = {
  // Run ESLint and Prettier on JS/TS files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // Format other file types with Prettier
  '**/*.{json,md,yml,yaml}': ['prettier --write'],

  // Format CSS files
  '**/*.{css,scss}': ['prettier --write'],
}
