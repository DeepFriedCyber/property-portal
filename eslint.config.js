// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a compatibility instance with required parameters
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {}
});

// Define ignores at the top level
const ignores = [
  'node_modules/',
  '**/dist/**',
  '**/build/**',
  '.turbo/',
  '*.config.js',
  '*.config.ts',
  '.eslintrc.json',
  'prettier.config.js',
  'coverage/',
  '.next/',
  'out/',
  'storybook-static/',
  '**/*.d.ts',
  '**/property-portal/property-portal/**'
];

export default [
  // Global ignores configuration
  {
    ignores
  },
  
  // Main configuration using compatibility layer
  ...compat.config({
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
      'plugin:prettier/recommended'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    env: {
      browser: true,
      node: true,
      es2021: true
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      'camelcase': ['error', { properties: 'always' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ]
    },
    overrides: [
      // TypeScript files
      {
        files: ['**/*.ts', '**/*.tsx'],
        extends: [
          'plugin:@typescript-eslint/recommended',
          'plugin:import/typescript'
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          },
          projectService: true
        },
        settings: {
          'import/resolver': {
            typescript: {
              alwaysTryTypes: true
            }
          }
        },
        rules: {
          'import/no-unresolved': [
            'error',
            {
              'ignore': ['^@/', '^@root/', '^@lib/', '^@components/', '^@your-org/', '^leaflet$']
            }
          ],
          '@typescript-eslint/naming-convention': [
            'error',
            {
              selector: 'variable',
              format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
              leadingUnderscore: 'allow'
            },
            {
              selector: 'function',
              format: ['camelCase', 'PascalCase']
            },
            {
              selector: 'parameter',
              format: ['camelCase'],
              leadingUnderscore: 'allow'
            },
            {
              selector: 'typeLike',
              format: ['PascalCase']
            }
          ],
          '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
      },
      // Test files
      {
        files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
        env: {
          jest: true,
          mocha: true
        },
        rules: {
          'no-undef': 'off'
        }
      }
    ]
  })
];