module.exports = {
  root: true,
<<<<<<< HEAD
  env: {
    browser: true,
    node: true,
    es2021: true,
    vitest: true,
  },
=======
>>>>>>> clean-branch
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
<<<<<<< HEAD
    'plugin:import/recommended',
    'plugin:import/typescript',
    'next/core-web-vitals',
    'prettier', // Make sure this is last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'vitest'],
=======
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
>>>>>>> clean-branch
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
<<<<<<< HEAD
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-unused-vars': 'off', // Use TypeScript's version instead

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-duplicate-imports': 'error',
    camelcase: ['error', { properties: 'always' }],

    // Import
    'import/no-unresolved': [
      'error',
      {
        ignore: ['^@/', '^@root/', '^@lib/', '^@components/', '^leaflet$'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
=======
      typescript: {},
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
>>>>>>> clean-branch
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
        vitest: true,
      },
<<<<<<< HEAD
      extends: ['plugin:vitest/recommended'],
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.turbo/',
    '*.config.js',
    '*.config.ts',
    'prettier.config.js',
    'coverage/',
    'packages/db/src/*.js',
  ],
}
=======
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
>>>>>>> clean-branch
