module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'import'],
  rules: {
    // Errors - these will cause CI to fail
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off', // Turned off in favor of TypeScript's version
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'react/prop-types': 'off', // Not needed with TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    
    // Warnings - these won't cause CI to fail
    'prefer-const': 'warn',
    'no-var': 'warn',
    'eqeqeq': 'warn',
    'import/order': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.next',
    '.turbo',
    'coverage',
    'public',
    '*.config.js',
    '*.config.ts',
  ],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      extends: ['plugin:testing-library/react', 'plugin:jest/recommended'],
    },
    {
      files: ['cypress/**/*.ts', 'cypress/**/*.tsx', '**/*.cy.ts', '**/*.cy.tsx'],
      plugins: ['cypress'],
      extends: ['plugin:cypress/recommended'],
      env: {
        'cypress/globals': true,
      },
    },
  ],
};