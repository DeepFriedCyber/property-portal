// This file is intentionally written with style issues to test ESLint and Prettier

function badlyFormattedFunction(a, b) {
  // This has wrong indentation and spacing
  const x = a + b

  if (x > 10) {
    console.log('This should trigger an ESLint warning')
    return x * 2
  }

  // Unused variable should trigger a warning
  const unused = 'This is not used'

  return x
}
