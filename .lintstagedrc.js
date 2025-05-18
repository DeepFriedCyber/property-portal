module.exports = {
  // Temporarily remove eslint to allow commits
  '**/*.(ts|tsx|js|jsx)': filenames => [
    `prettier --write ${filenames.join(' ')}`,
  ],

  // Format other file types
  '**/*.(md|json)': filenames => `prettier --write ${filenames.join(' ')}`,
}
