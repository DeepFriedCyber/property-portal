module.exports = {
  // Lint & format TypeScript and JavaScript files
  '**/*.(ts|tsx|js|jsx)': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],

  // Format other file types
  '**/*.(md|json)': (filenames) => `prettier --write ${filenames.join(' ')}`,
};